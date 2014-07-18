/*
 * Telnet Proxy Daemon
 * Copyright (c) 2004  AwesomePlay Productions, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE.
 */

#include <time.h>
#include <signal.h>
#include <ctype.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <inttypes.h>
#include <errno.h>
#include <string.h>
#include <pthread.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <sys/poll.h>
#include <netdb.h>
#include <stdarg.h>
#include <pwd.h>
#include <grp.h>
#include <assert.h>

/* ---- CONFIGURATION ---- */

#define BUFFER_SIZE 2048

#define DEFAULT_MAX_CLIENTS 50
#define DEFAULT_MAX_HOST_CLIENTS 3
#define DEFAULT_LISTEN_PORT 9596
#define DEFAULT_HOST_LIST "hosts.txt"
#define DEFAULT_BAN_LIST "deny.txt"
#define DEFAULT_CONNECT_TIMEOUT 30
#define DEFAULT_ACTIVITY_TIMEOUT (60 * 15)

/* ---- DATA TYPES ---- */

struct AllowedServer {
	char* host;
	uint16_t port;
	struct AllowedServer* next;
};

struct BannedClient {
	struct sockaddr_storage addr;
	uint8_t mask;
	struct BannedClient* next;
};

struct ClientAddr {
	struct sockaddr_storage addr;
	uint count;
	struct ClientAddr* prev;
	struct ClientAddr* next;
};

struct ClientInfo {
	int sock;
	struct sockaddr_storage addr;
};

struct Option {
	char short_name;
	char* long_name;
	char** string_arg;
	int* int_arg;
	int* bool_arg;
};

enum ClientState {
	CLIENT_INIT,
	CLIENT_ACTIVE,
	CLIENT_FINISH,
	CLIENT_SHUTDOWN
};

enum LogLevel {
	LOG_NOTICE,
	LOG_WARNING,
	LOG_ERROR,
	LOG_DEBUG
};

/* ---- FUNCTIONS ---- */

int allowed_servers_load (char* filename);
int allowed_servers_check (char* host, int port);

int banned_clients_load (char* filename);
int banned_clients_check (struct sockaddr_storage* addr);

int client_list_add (struct sockaddr_storage* addr);
void client_list_remove (struct sockaddr_storage* addr);

void signal_sighup (int);
void signal_sigterm (int);

int parse_options (struct Option*, int argc, char** argv);

int log_open (char* filename);
void log_msg (enum LogLevel level, char* format, ...);
void log_close (void);

int write_string (int sock, char* string); /* not safe, but simple */

char* sockaddr_name_of (struct sockaddr_storage* addr, char* buffer, size_t len);

/* ---- GLOBALS ---- */

struct AllowedServer* allowed_servers = NULL;
pthread_mutex_t allowed_servers_lock = PTHREAD_MUTEX_INITIALIZER;

struct BannedClient* banned_clients = NULL;
pthread_mutex_t banned_clients_lock = PTHREAD_MUTEX_INITIALIZER;

int max_clients = DEFAULT_MAX_CLIENTS;
int max_host_clients = DEFAULT_MAX_HOST_CLIENTS;
int client_count = 0;
struct ClientAddr* client_list = NULL;
pthread_mutex_t client_list_lock = PTHREAD_MUTEX_INITIALIZER;

int connect_timeout = DEFAULT_CONNECT_TIMEOUT;
int activity_timeout = DEFAULT_ACTIVITY_TIMEOUT;

volatile int reload_flag = 0;
volatile int shutdown_flag = 0;

FILE* log_file = NULL;

/* ---- DEBUG LOG ---- */
#ifdef NDEBUG
#define log_dbg(format,...)
#else
#define log_dbg(format,args...) log_msg(LOG_DEBUG, (format), ## args)
#endif /* NDEBUG */

/* ---- BEGIN CODE ---- */

/* write_string()
   very dumb fuction to use - doesn't guarantee any or even
   some of the string is actually written
*/
int
write_string (int sock, char* string)
{
	return write(sock, string, strlen(string));
}

/* print_usage()
   print out a usage error message
*/
void
print_usage (char* self, struct Option* options)
{
	int i;

	assert(self != NULL);
	assert(options != NULL);

	fprintf(stderr, "Usage: ./proxy");
	for (i = 0; options[i].short_name != 0 || options[i].long_name != NULL; ++i) {
		if (options[i].long_name != NULL) {
			fprintf(stderr, " [--%s", options[i].long_name);
			if (options[i].short_name != 0)
				fprintf(stderr, "|-%c", options[i].short_name);
		} else {
			fprintf(stderr, " [-%c", options[i].short_name);
		}

		if (options[i].string_arg != NULL)
			fprintf(stderr, " <string>");
		else if (options[i].int_arg != NULL)
			fprintf(stderr, " <int>");

		fprintf(stderr, "]");
	}
	fprintf(stderr, "\n");
}

/* parse_options()
   read in options
   return 0 on success, -1 on failure
*/
int
parse_options (struct Option* options, int argc, char** argv)
{
	int opt;
	int i;

	assert(options != NULL);
	assert(argc >= 1);
	assert(argv != NULL);

	/* iterator through options */
	for (opt = 1; opt < argc; ++opt) {
		/* find corresponding option */
		for (i = 0; options[i].short_name != 0 || options[i].long_name != NULL; ++i) {
			if (
				/* match short opt? */
				(options[i].short_name != 0 && argv[opt][0] == '-' && argv[opt][1] == options[i].short_name && argv[opt][2] == 0) ||
				/* match long opt? */
				(options[i].long_name != NULL && argv[opt][0] == '-' && argv[opt][1] == '-' && !strcmp(argv[opt] + 2, options[i].long_name))
			/* found a match! */
			) {
				/* need arg but have none? */
				if (opt == argc - 1 && (options[i].int_arg != NULL || options[i].string_arg != NULL)) {
					fprintf(stderr, "Error: No value given for option: %s\n", argv[opt]);
					print_usage(argv[0], options);
					return -1;
				}

				/* set string arg */
				if (options[i].string_arg != NULL)
					*options[i].string_arg = argv[++opt];
				/* set int arg */
				if (options[i].int_arg != NULL)
					*options[i].int_arg = atol(argv[++opt]);
				/* set bool arg */
				if (options[i].bool_arg != NULL)
					*options[i].bool_arg = 1;

				break;
			}
		}

		/* hit end of options?  bad juju */
		if (options[i].short_name == 0 && options[i].long_name == NULL) {
			/* error! */
			fprintf(stderr, "Error: Invalid option: %s\n", argv[opt]);
			print_usage(argv[0], options);
			return -1;
		}
	}

	/* all found */
	return 0;
}

/* build_addr_mask()
   creates a bit mask from the given mask length
   used for network address masks (i.e., 192.168.1.2/24)
   NOTE: code taken from FreeBSD 'route' command source
   Copyright (C) FreeBSD
*/
void
build_addr_mask (uint8_t* buf, int mask, int max)
{
	int q, r;

	assert(buf != NULL);
	assert(mask <= max);
	assert(max > 0);

	memset (buf, 0, max / 8);

	q = mask >> 3;
	r = mask & 7;

	if (q > 0)
		memset(buf, 0xff, q);
	if (r > 0)
		*(buf + q) = (0xff00 >> r) & 0xff;
}

/* apply_addr_mask()
   applies the bit mask to the given address
*/
void
apply_addr_mask (void* addr, uint8_t mask, int family)
{
	int i;
	uint8_t buf[32]; /* more than big enough */
	int size;

	assert(addr != NULL);
	assert(mask > 0);
	assert(family == AF_INET || family == AF_INET6);

	if (family == AF_INET6)
		size = 16; /* 16 bytes in IPv6 */
	else
		size = 4; /* 4 bytes in IPv4 */

	build_addr_mask(buf, mask, size * 8);
	for (i = 0; i < size; ++i)
		((uint8_t*)addr)[i] &= buf[i];
}

/* addr_match()
   return 0 if both addresses match
*/
int
addr_match (struct sockaddr_storage* addr1, struct sockaddr_storage* addr2)
{
	assert(addr1 != NULL);
	assert(addr2 != NULL);

	/* different family?  not the same */
	if (addr1->ss_family != addr2->ss_family)
		return -1;

	/* check IPv6 */
	if (addr1->ss_family == AF_INET6) {
		if (IN6_ARE_ADDR_EQUAL(&((struct sockaddr_in6*)addr1)->sin6_addr, &((struct sockaddr_in6*)addr2)->sin6_addr))
			return 0;

	/* check IPv4 address */
	} else if (addr1->ss_family == AF_INET) {
		if (!memcmp(&((struct sockaddr_in*)addr1)->sin_addr, &((struct sockaddr_in*)addr2)->sin_addr, sizeof(((struct sockaddr_in*)addr2)->sin_addr)))
			return 0;
	}

	/* no match */
	return -1;
}

/* parse_addr()
   parses a network address
   returns -1 on parse error
*/
int
parse_addr (char* addr, struct sockaddr_storage* host, uint8_t* mask)
{
	char buffer[128];
	int inmask;
	char* slash;

	assert(addr != NULL);
	assert(host != NULL);
	assert(mask != NULL);

	/* clear address */
	memset(host, 0, sizeof(struct sockaddr_storage));

	/* put in buffer, snprintf() guarnatees NUL byte */
	snprintf(buffer, sizeof(buffer), "%s", addr);

	/* get mask - have we a mask? */
	inmask = -1;
	slash = strchr(buffer, '/');
	if (slash != NULL) {
		*slash = '\0';
		++ slash;

		/* don't use atoi or strtol, guarantee we parse it right */
		inmask = 0;
		while (*slash != '\0') {
			if (!isdigit(*slash))
				break;
			inmask *= 10;
			inmask += *slash - '0';
			++ slash;
		}

		/* only numbers, rights? */
		if (*slash != '\0')
			return -1;
	}

	/* parse IPv6 first */
	if (inet_pton(AF_INET6, buffer, &((struct sockaddr_in6*)host)->sin6_addr) > 0) {
		/* mask must be <= 128 */
		if (inmask > 128)
			return -1;
		/* default? */
		if (inmask == -1)
			inmask = 128;

		/* set family and mask */
		host->ss_family = AF_INET6;
		*mask = inmask;
		return 0;

	/* try IPv4 parsing */
	} else if (inet_pton(AF_INET, buffer, &((struct sockaddr_in*)host)->sin_addr) > 0) {
		// check mask
		if (inmask > 32)
			return -1; // FAIL
		/* default? */
		if (inmask == -1)
			inmask = 32;

		/* set family and mask */
		((struct sockaddr_in*)host)->sin_family = AF_INET;
		*mask = inmask;
		return 0;
	}

	/* no match */
	return -1;
}

/* allowed_servers_check()
   return 0 if the host/port is allowed, -1 if it's not
*/
int
allowed_servers_check (char* host, int port)
{
	struct AllowedServer* hinfo;

	assert(host != NULL);
	assert(port > 0 && port <= UINT16_MAX);

	pthread_mutex_lock(&allowed_servers_lock);

	/* scan list */
	hinfo = allowed_servers;
	while (hinfo != NULL) {
		/* match?  return success (0) */
		if (port == hinfo->port && !strcmp(host, hinfo->host)) {
			pthread_mutex_unlock(&allowed_servers_lock);
			return 0;
		}
		hinfo = hinfo->next;
	}

	pthread_mutex_unlock(&allowed_servers_lock);

	/* no matches, failure (-1) */
	return -1;
}

/* allowed_servers_load()
   load the list of allowed hosts
*/
int
allowed_servers_load (char* filename)
{
	FILE* file;
	char line[512];
	int lineno;
	long port;
	char* sep;
	char* end;
	struct AllowedServer* hinfo;

	/* open file */
	file = fopen(filename, "rt");
	if (file == NULL) {
		log_msg(LOG_ERROR, "allowed_servers_load(): fopen() failed for '%s': %s\n", filename, strerror(errno));
		return -1;
	}

	/* lock resource */
	pthread_mutex_lock(&allowed_servers_lock);

	/* clear list */
	while (allowed_servers != NULL) {
		hinfo = allowed_servers->next;
		free(allowed_servers->host);
		free(allowed_servers);
		allowed_servers = hinfo;
	}

	/* read in file */
	lineno = 0;
	while (fgets(line, sizeof(line), file) != NULL) {
		++lineno;

		/* trim spaces/newlines */
		for (end = line + strlen(line) - 1; end >= line; --end)
			if (isspace(*end))
				*end = 0;

		/* empty? */
		if (!strlen(line))
			continue;

		/* find the host:port separator */
		sep = strchr(line, ':');
		if (sep == NULL) {
			log_msg(LOG_WARNING, "allowed_servers_load(): malformed entry at %s:%d\n", filename, lineno);
			continue;
		}
		*sep = 0;

		/* read and sanity check the port number */
		port = strtol(sep + 1, &end, 10);
		if (*end != 0 || port < 1 || port > UINT16_MAX) {
			log_msg(LOG_WARNING, "allowed_servers_load(): malformed entry at %s:%d\n", filename, lineno);
			continue;
		}

		/* sanity check the host name */
		if (strlen(line) < 1) {
			log_msg(LOG_WARNING, "allowed_servers_load(): malformed entry at %s:%d\n", filename, lineno);
			continue;
		}

		/* allocate */
		hinfo = (struct AllowedServer*)malloc(sizeof(struct AllowedServer));
		if (hinfo == NULL) {
			log_msg(LOG_WARNING, "allowed_servers_load(): malloc() failed: %s\n", strerror(errno));
			continue;
		}

		/* copy host string */
		hinfo->host = strdup(line);
		if (hinfo->host == NULL) {
			log_msg(LOG_WARNING, "allowed_servers_add(): strdup() failed: %s\n", strerror(errno));
			free(hinfo);
			continue;
		}

		/* set port */
		hinfo->port = port;

		/* make new list head */
		hinfo->next = allowed_servers;
		allowed_servers = hinfo;
	}

	/* unlock */
	pthread_mutex_unlock(&allowed_servers_lock);

	/* finish up */
	fclose(file);

	return 0;
}

/* banned_clients_load()
   load the list of banned clients
*/
int
banned_clients_load (char* filename)
{
	FILE* file;
	char line[512];
	char* end;
	int lineno;
	struct sockaddr_storage addr;
	uint8_t mask;
	struct BannedClient* cinfo;

	/* open file */
	file = fopen(filename, "rt");
	if (file == NULL) {
		log_msg(LOG_ERROR, "banned_clients_load(): fopen() failed for '%s': %s\n", filename, strerror(errno));
		return -1;
	}

	/* lock resource */
	pthread_mutex_lock(&banned_clients_lock);

	/* clear list */
	while (banned_clients != NULL) {
		cinfo = banned_clients->next;
		free(banned_clients);
		banned_clients = cinfo;
	}

	/* read in file */
	lineno = 0;
	while (fgets(line, sizeof(line), file) != NULL) {
		++lineno;

		/* trim spaces/newlines */
		for (end = line + strlen(line) - 1; end >= line; --end)
			if (isspace(*end))
				*end = 0;

		/* empty? */
		if (!strlen(line))
			continue;

		/* parse */
		if (parse_addr(line, &addr, &mask) == -1) {
			log_msg(LOG_WARNING, "banned_clients_load(): malformed entry at %s:%d\n", filename, lineno);
			continue;
		}


		/* allocate */
		cinfo = (struct BannedClient*)malloc(sizeof(struct BannedClient));
		if (cinfo == NULL) {
			log_msg(LOG_WARNING, "banned_clients_load(): malloc() failed: %s\n", strerror(errno));
			continue;
		}

		/* set data */
		cinfo->addr = addr;
		cinfo->mask = mask;

		/* make new list head */
		cinfo->next = banned_clients;
		banned_clients = cinfo;
	}

	/* unlock */
	pthread_mutex_unlock(&banned_clients_lock);

	/* finish up */
	fclose(file);

	return 0;
}

/* banned_clients_check()
   returns non-zero if address is banned
*/
int
banned_clients_check (struct sockaddr_storage* addr)
{
	struct BannedClient* cinfo;
	struct sockaddr_storage temp;

	/* lock */
	pthread_mutex_lock(&banned_clients_lock);

	/* iterate over all banned clients */
	cinfo = banned_clients;
	while (cinfo != NULL) {
		/* not same family?  skip */
		if (cinfo->addr.ss_family != addr->ss_family) {
			cinfo = cinfo->next;
			continue;
		}

		/* temporary address */
		temp = *addr;

		/* apply mask */
		if (cinfo->addr.ss_family == AF_INET6)
			apply_addr_mask(&((struct sockaddr_in6*)&temp)->sin6_addr, cinfo->mask, cinfo->addr.ss_family);
		else
			apply_addr_mask(&((struct sockaddr_in*)&temp)->sin_addr, cinfo->mask, cinfo->addr.ss_family);

		/* check equality */
		if (addr_match(&temp, &cinfo->addr) == 0) {
			/* match - banned!  unlock and return */
			pthread_mutex_unlock(&banned_clients_lock);
			return -1;
		}

		cinfo = cinfo->next;
	}

	/* unlock */
	pthread_mutex_unlock(&banned_clients_lock);

	/* no matches, all good */
	return 0;
}

/* client_add()
   add another count for the given address
   returns 0 on success
   returns -1 on failure (too many total clients)
   returns -2 on failure (too many connections from this address)
*/
int
client_add (struct sockaddr_storage* addr)
{
	struct ClientAddr* cinfo;

	/* lock */
	pthread_mutex_lock(&client_list_lock);

	/* already at max? fail. */
	if (client_count >= max_clients) {
		pthread_mutex_unlock(&client_list_lock);
		return -1;
	}

	/* find client */
	cinfo = client_list;
	while (cinfo != NULL) {
		if (addr_match(&cinfo->addr, addr) == 0) {
			/* at max already? */
			if (cinfo->count >= max_host_clients) {
				pthread_mutex_unlock(&client_list_lock);
				return -2;
			}

			/* increment count, break */
			++cinfo->count;
			break;
		}

		cinfo = cinfo->next;
	}

	/* no client found? */
	if (cinfo == NULL) {
		/* allocate */
		cinfo = (struct ClientAddr*)malloc(sizeof(struct ClientAddr));
		if (cinfo == NULL) {
			log_msg(LOG_ERROR, "client_add(): malloc() failed: %s\n", strerror(errno));
			pthread_mutex_unlock(&client_list_lock);
			return -2;
		}

		/* initialize */
		cinfo->addr = *addr;
		cinfo->count = 1;

		/* put on list */
		cinfo->prev = NULL;
		cinfo->next = client_list;
		if (client_list != NULL)
			client_list->prev = cinfo;
		client_list = cinfo;
	}

	/* unlock */
	pthread_mutex_unlock(&client_list_lock);

	return 0;
}

/* client_count_dec()
   decrements the number of connected clients
*/
void
client_remove (struct sockaddr_storage* addr)
{
	struct ClientAddr* cinfo;

	/* lock */
	pthread_mutex_lock(&client_list_lock);

	/* find client */
	cinfo = client_list;
	while (cinfo != NULL) {
		/* match? decrement counts */
		if (addr_match(&cinfo->addr, addr) == 0) {
			--cinfo->count;
			--client_count;

			/* last of our kind (eek ;-) remove structure */
			if (cinfo->count == 0) {
				/* update pointers */
				if (cinfo->prev != NULL)
					cinfo->prev->next = cinfo->next;
				else
					client_list = cinfo->next;
				if (cinfo->next != NULL)
					cinfo->next->prev = cinfo->prev;

				/* destroy! */
				free(cinfo);
			}

			/* all done */
			break;
		}

		/* increment */
		cinfo = cinfo->next;
	}

	/* unlock */
	pthread_mutex_unlock(&client_list_lock);
}

/* log_open()
   open the log file
*/
int
log_open (char* filename)
{
	/* no file? log to stderr */
	if (filename == NULL) {
		log_file = stderr;
		return 0;
	}

	/* open log file */
	log_file = fopen(filename, "w+");
	if (log_file == NULL) {
		fprintf(stderr, "ERROR: log_open(): could not open %s: %s\n", filename, strerror(errno));
		return -1;
	}

	return 0;
}

/* log_close()
   close the log file
*/
void
log_close (void)
{
	if (log_file != stderr)
		fclose(log_file);

	log_file = NULL;
}

/* log_msg()
   write out a log message to the log file
*/
void
log_msg (enum LogLevel level, char* format, ...)
{
	va_list va;
	time_t t;
	struct tm lt;
	char time_buf[128];

	assert(format != NULL);

	/* lock */
	flockfile(log_file);

	/* time message */
	time(&t);
	localtime_r(&t, &lt);
	strftime(time_buf, sizeof(time_buf), "%Y-%m-%d %H:%M:%S", &lt);
	fprintf(log_file, "%s - ", time_buf);

	/* print out level prefix */
	switch (level) {
		case LOG_NOTICE:
			break;
		case LOG_WARNING:
			fprintf(log_file, "WARNING: ");
			break;
		case LOG_ERROR:
			fprintf(log_file, "**ERROR** ");
			break;
		case LOG_DEBUG:
			fprintf(log_file, "[debug]: ");
			break;
	}

	/* print out message */
	va_start(va, format);
	vfprintf(log_file, format, va);
	va_end(va);

	/* flush */
	fflush(log_file);

	/* unlock */
	funlockfile(log_file);
}

/* sockaddr_name_of()
   get a printable version of a socket address
*/
char*
sockaddr_name_of (struct sockaddr_storage* addr, char* buffer, size_t len)
{
	char host_buf[NI_MAXHOST];
	char serv_buf[NI_MAXSERV];

	assert(addr != NULL);
	assert(buffer != NULL);
	assert(len > 0);

	/* get info */
	getnameinfo((struct sockaddr*)addr, sizeof(struct sockaddr_storage), host_buf, sizeof(host_buf), serv_buf, sizeof(serv_buf), NI_NUMERICHOST | NI_NUMERICSERV);

	/* format out */
	if (strchr(host_buf, ':'))
		snprintf(buffer, len, "[%s]:%s", host_buf, serv_buf);
	else
		snprintf(buffer, len, "%s:%s", host_buf, serv_buf);

	return buffer;
}

int
connect_to_server (char* host, int port)
{
	int sock;
	int err;
	int count;
	struct addrinfo hints;
	struct addrinfo* res;
	struct addrinfo* res_head;
	char portstr[16];

	assert(host != NULL);
	assert(port > 0 && port <= UINT16_MAX);

	/* setup hints */
	memset(&hints, 0, sizeof(hints));
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_protocol = IPPROTO_TCP;

	/* make port into a string */
	snprintf(portstr, sizeof(portstr), "%d", port);

	/* get address list */
	if ((err = getaddrinfo(host, portstr, &hints, &res_head)) != 0) {
		log_msg(LOG_WARNING, "connect_to_server(): getaddrinfo() failed: %s\n", gai_strerror(err));
		return -1;
	}

	/* iterator through addresses */
	count = 0;
	res = res_head;
	while (res != NULL) {
		/* make socket */
		sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
		if (sock != -1) {
			/* connect */
			if (connect(sock, res->ai_addr, res->ai_addrlen) == 0) {
				freeaddrinfo(res_head);
				return sock;
			}
			close(sock);
		}
		
		++count;
		res = res->ai_next;
	}

	freeaddrinfo(res_head);

	/* none successful */
	if (count == 0)
		log_msg(LOG_WARNING, "connect_to_server(): no addresses found for %s:%d\n", host, port);
	else
		log_msg(LOG_NOTICE, "host %s:%d is currently unavailable\n", host, port);
	return -1;
}

/* parse_connect_command()
   parses the connect command line
   returns 0 if successful, -1 on parse error
*/
int
parse_connect_command(char* command, char** host, int* port)
{
	char* sep;
	char* end;
	char* portstr;
	long portval;

	assert(command != NULL);
	assert(host != NULL);
	assert(port != NULL);

	/* initialize */
	*host = NULL;
	*port = 0;

	/* erase whitespace at end */
	for (end = command + strlen(command) - 1; end >= command && isspace(*end); --end)
		*end = 0;

	/* must begin with 'connect ' */
	if (strncmp(command, "connect ", 8))
		return -1;

	/* host follows */
	*host = command + 8;

	/* find space separating host and port */
	sep = strchr(*host, ' ');
	if (sep == NULL) {
		/* no separator - failure */
		return -1;
	}

	/* end host and start port */
	*sep = 0;
	portstr = sep + 1; 

	/* parse port for validity */
	portval = strtol(portstr, &end, 10);
	if (*end != 0) {
		/* wasn't all a number - failure */
		return -1;
	}

	/* make sure port is in a valid range */
	if (portval < 1 || portval > UINT16_MAX) {
		/* not in range - failure */
		return -1;
	}

	/* make sure host has data */
	if (strlen(*host) == 0) {
		/* empty host - failure */
		return -1;
	}

	/* all good */
	*port = (int)portval;
	return 0;
}

/* client_main()
   main loop for the client threads
*/
void*
client_main (void* arg)
{
	int client;
	int server;
	int err;
	char cbuffer[BUFFER_SIZE];
	int clen;
	char sbuffer[BUFFER_SIZE];
	int slen;
	struct pollfd pollfds[2];
	char* end;
	char* host;
	int port;
	enum ClientState state;
	struct sockaddr_storage caddr;
	char client_name[128];
	time_t start;
	time_t activity;

	assert(arg != NULL);
	
	/* get client socket */
	client = ((struct ClientInfo*)arg)->sock;
	caddr = ((struct ClientInfo*)arg)->addr;
	free(arg);

	/* get client_name */
	sockaddr_name_of(&caddr, client_name, sizeof(client_name));

	/* initialize client data */
	clen = 0;
	pollfds[0].fd = client;
	pollfds[0].events = POLLIN;

	/* initialize server data */
	server = -1;
	slen = 0;
	pollfds[1].fd = -1;
	pollfds[1].events = 0;

	/* start time */
	start = time(NULL);
	activity = time(NULL);

	/* client loop */
	state = CLIENT_INIT;
	do {
		/* poll fds */
		pollfds[0].revents = 0;
		pollfds[1].revents = 0;
		err = poll(pollfds, (server == -1) ? 1 : 2, 1000);

		log_dbg("poll() for %s: %d %hx %hx %d %d\n", client_name, err, pollfds[0].revents, pollfds[1].revents, clen, slen);

		/* handle error */
		if (err < 0 && errno != EINTR) {
			log_msg(LOG_ERROR, "client_main(%d): poll() failed: %s\n", client, strerror(errno));
			state = CLIENT_SHUTDOWN;
		}

		/* server disconnected? */
		if (pollfds[1].revents & POLLHUP) {
			close(server);
			server = -1;
			state = CLIENT_FINISH;
			pollfds[1].revents = 0;
		}

		/* client disconnected? */
		if (pollfds[0].revents & POLLHUP) {
			close(client);
			client = -1;
			state = CLIENT_SHUTDOWN;
			pollfds[0].revents = 0;
		}

		/* read in from client */
		if (pollfds[0].revents & POLLIN && clen < BUFFER_SIZE) {
			/* receive data */
			err = recv(pollfds[0].fd, cbuffer + clen, BUFFER_SIZE - clen, 0);
			if (err < 0 && errno != EINTR) {
				log_msg(LOG_ERROR, "client_main(%d): recv(client) failed: %s\n", client, strerror(errno));
				state = CLIENT_SHUTDOWN;
			}

			/* eof?  why no POLLHUP?  grr! */
			if (err == 0) {
				close(client);
				client = -1;
				state = CLIENT_SHUTDOWN;
			}

			/* increment buffer count */
			if (err > 0)
				clen += err;

			/* we have activity */
			activity = time(NULL);
		}

		/* read in from server */
		if (pollfds[1].revents & POLLIN && slen < BUFFER_SIZE) {
			/* receive data */
			err = recv(pollfds[1].fd, sbuffer + slen, BUFFER_SIZE - slen, 0);
			if (err < 0 && errno != EINTR) {
				log_msg(LOG_ERROR, "client_main(%d): recv(server) failed: %s\n", client, strerror(errno));
				state = CLIENT_SHUTDOWN;
			}

			/* eof?  why no POLLHIP?  grr! */
			if (err == 0) {
				close(server);
				server = -1;
				state = CLIENT_FINISH;
			}

			/* increment buffer count */
			if (err > 0)
				slen += err;
		}

		/* write out to client */
		if (client != -1 && slen > 0) {
			/* send data */
			err = send(pollfds[0].fd, sbuffer, slen, MSG_DONTWAIT);
			if (err < 0 && errno != EINTR) {
				log_msg(LOG_ERROR, "client_main(%d): send(client) failed: %s\n", client, strerror(errno));
				state = CLIENT_SHUTDOWN;
			}

			/* decrement buffer count */
			if (err > 0)
				slen -= err;
		}

		/* write out to server */
		if (server != -1 && clen > 0) {
			/* send data */
			err = send(pollfds[1].fd, cbuffer, clen, MSG_DONTWAIT);
			if (err < 0 && errno != EINTR) {
				log_msg(LOG_ERROR, "client_main(%d): send(server) failed: %s\n", client, strerror(errno));
				state = CLIENT_SHUTDOWN;
			}

			/* decrement buffer count */
			if (err > 0)
				clen -= err;
		}

		/* process client states */
		switch (state) {
			case CLIENT_INIT:
				/* check if we have a line ready for consumption */
				if (clen == 0)
					break;
				for (end = cbuffer; end - cbuffer < clen; ++end)
					if (*end == '\n')
						break;
				if (end - cbuffer >= clen)
					break;
				*end = 0;

				log_dbg("CLIENT %s INPUT: %s\n", client_name, cbuffer);

				/* parse connect command */
				if (parse_connect_command(cbuffer, &host, &port)) {
					log_msg(LOG_NOTICE, "client %s sent invalid connect command\n", client_name);
					slen = snprintf(sbuffer, sizeof(sbuffer), "Invalid connect command.\r\n");
					state = CLIENT_FINISH;
					break;
				}

				log_dbg("CLIENT %s REQUEST: %s %d\n", client_name, host, port);
				
				/* verify host:port is allowed */
				if (allowed_servers_check(host, port)) {
					log_msg(LOG_NOTICE, "client %s attempted connection to server %s:%d - access denied\n", client_name, host, port);
					slen = snprintf(sbuffer, sizeof(sbuffer), "Access denied to %s:%d.\r\n", host, port);
					state = CLIENT_FINISH;
					break;
				}

				log_dbg("CLIENT %s CONNECTING: %s %d\n", client_name, host, port);

				/* connect to server */
				server = connect_to_server(host, port);
				if (server == -1) {
					slen = snprintf(sbuffer, sizeof(sbuffer), "Failed to connect to %s:%d.\r\n", host, (int)port);
					state = CLIENT_FINISH;
					break;
				}

				log_dbg("CLIENT %s READY: %s %d\n", client_name, host, port);

				/* make active */
				pollfds[1].fd = server;
				log_msg(LOG_NOTICE, "client %s connected to server %s:%d\n", client_name, host, port);
				state = CLIENT_ACTIVE;

				/* clean up cbuffer */
				if (clen > end - cbuffer + 1) {
					memmove(cbuffer, end + 1, clen - (end - cbuffer + 1));
					clen -= (end - cbuffer + 1);
				} else
					clen = 0;

				/* reset activity timer */
				activity = time(NULL);

				break;
			case CLIENT_ACTIVE:
				break;
			case CLIENT_FINISH:
				/* if there's nothing left to send to client,
				   shutdown the connection */
				if (slen == 0)
					state = CLIENT_SHUTDOWN;
				break;
			case CLIENT_SHUTDOWN:
				break;
		}

		/* set client poll events */
		pollfds[0].events = 0;
		if (clen < BUFFER_SIZE)
			pollfds[0].events |= POLLIN;
		if (slen > 0)
			pollfds[0].events |= POLLOUT;

		/* set server poll events */
		if (server != -1) {
			pollfds[1].events = 0;
			if (slen < BUFFER_SIZE)
				pollfds[1].events = POLLIN;
			if (clen > 0)
				pollfds[1].events |= POLLOUT;
		}

		/* more than the connect timeout in seconds has passed? */
		if (state == CLIENT_INIT && time(NULL) - start >= connect_timeout) {
			log_msg(LOG_NOTICE, "client %s connect timeout (%d seconds)\n", client_name, connect_timeout);
			slen = snprintf(sbuffer, sizeof(sbuffer), "Connection timeout: no connect command given within %d seconds.\r\n", connect_timeout);
			state = CLIENT_FINISH;
		}


		/* no recent activity?  shutdown */
		if (state == CLIENT_ACTIVE && time(NULL) - activity >= activity_timeout) {
			log_msg(LOG_NOTICE, "disconnecting %s due to lack of activity (%d seconds)\n", client_name, activity_timeout);
			close(server);
			server = -1;
			slen = snprintf(sbuffer, sizeof(sbuffer), "Disconnecting to due lack of activity.\r\n");
			state = CLIENT_FINISH;
		}

	} while (state != CLIENT_SHUTDOWN);

	/* disconnection message */
	log_msg(LOG_NOTICE, "disconnecting client %s\n", client_name);

	/* shutdown sockets */
	if (client != -1)
		close(client);
	if (server != -1)
		close(server);

	log_dbg("decrementing client count for %s\n", client_name);

	/* decrement current client count */
	client_remove(&caddr);

	log_dbg("ending thread for %s\n", client_name);

	return NULL;
}

int
create_listen_socket (const char* host, int port)
{
	int sock;
	int opt;
	int err;
	char portstr[16];
	struct addrinfo hints;
	struct addrinfo* res;

	assert(host != NULL);
	assert(port > 0 && port <= UINT16_MAX);

	/* setup hints */
	memset(&hints, 0, sizeof(hints));
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_protocol = IPPROTO_TCP;

	/* make port into a string */
	snprintf(portstr, sizeof(portstr), "%d", port);

	/* get address list */
	if ((err = getaddrinfo(host, portstr, &hints, &res)) != 0) {
		log_msg(LOG_WARNING, "connect_to_server(): getaddrinfo() failed: %s\n", gai_strerror(err));
		freeaddrinfo(res);
		return -1;
	}

	/* create socket */
	sock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
	if (sock == -1) {
		log_msg(LOG_ERROR, "create_listen_socket(): socket() failed: %s\n", strerror(errno));
		freeaddrinfo(res);
		return -1;
	}
	/* allow reuse of server port */
	opt = 1;
	setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

	/* bind addr to socket */
	if (bind(sock, res->ai_addr, res->ai_addrlen) == -1) {
		log_msg(LOG_ERROR, "create_listen_socket(): bind() failed: %s\n", strerror(errno));
		close(sock);
		return -1;
	}

	/* free host information */
	freeaddrinfo(res);

	/* begin listening on socket */
	if (listen(sock, 5) == -1) {
		log_msg(LOG_ERROR, "create_listen_socket(): listen() failed: %s\n", strerror(errno));
		close(sock);
		return -1;
	}

	return sock;
}

int
create_client (int sock)
{
	int err;
	int client;
	struct sockaddr_storage sockaddr;
	socklen_t addr_len = sizeof(sockaddr);
	struct ClientInfo* cinfo;
	char client_name[128];
	pthread_attr_t p_attr;
	pthread_t p_thread;

	assert(sock >= 0);

	log_dbg("accepting client socket\n");

	/* get client socket */
	addr_len = sizeof(sockaddr);
	client = accept(sock, (struct sockaddr*)&sockaddr, &addr_len);
	if (client == -1) {
		log_msg(LOG_WARNING, "create_client(): accept() failed: %s\n", strerror(errno));
		return -1;
	}

	log_dbg("getting client name\n");

	/* get client_name */
	sockaddr_name_of(&sockaddr, client_name, sizeof(client_name));

	log_dbg("checking client %s with ban list\n", client_name);

	/* check if banned */
	if (banned_clients_check(&sockaddr) == -1) {
		log_msg(LOG_NOTICE, "rejected client %s, banned host/network\n", client_name);
		write_string(client, "Your client host or network is banned.\r\n");
		close(client);
		return -1;
	}

	log_dbg("checking client %s connection count\n", client_name);

	/* check client count */
	err = client_add(&sockaddr);

	if (err == -1) {
		log_msg(LOG_NOTICE, "rejected client %s, too many users\n", client_name);
		/* FIXME: this may not all get written out */
		write_string(client, "Maximum user count exceeded.\r\n");
		close(client);
		return -1;
	}
	if (err == -2) {
		log_msg(LOG_NOTICE, "rejected client %s, too many conncetion from that address\n", client_name);
		/* FIXME: this may not all get written out */
		write_string(client, "Maximum client count for your address exceeded.\r\n");
		close(client);
		return -1;
	}

	log_dbg("allocating client %s thread storage\n", client_name);

	/* allocate space to store client socket */
	cinfo = (struct ClientInfo*)malloc(sizeof(struct ClientInfo));
	if (cinfo == 0) {
		client_remove(&sockaddr);
		log_msg(LOG_WARNING, "create_client(): malloc() failed: %s\n", strerror(errno));
		log_msg(LOG_NOTICE, "disconnecting client %s\n", client_name);
		return -1;
	}
	cinfo->sock = client;
	cinfo->addr = sockaddr;

	/* connection message */
	log_msg(LOG_NOTICE, "connection from %s\n", client_name);

	/* initialize pthread attributes -
	   all threads shoudl be detached */
	pthread_attr_init(&p_attr);
	pthread_attr_setdetachstate(&p_attr, PTHREAD_CREATE_DETACHED);

	log_dbg("creating client %s thread\n", client_name);

	/* create thread */
	if (pthread_create(&p_thread, &p_attr, client_main, cinfo)) {
		client_remove(&sockaddr);
		log_msg(LOG_WARNING, "create_client(): pthread_create() failed: %s\n", strerror(errno));
		log_msg(LOG_NOTICE, "disconnecting client %s\n", client_name);
		close(client);
		free(cinfo);
		return -1;
	}

	log_dbg("done creating client %s\n", client_name);

	return client;
}

int
drop_privileges (char* user, char* group)
{
	struct group* grp;
	struct passwd* pwd;
	uid_t uid;
	gid_t gid;
	char* end;

	/* handle group */
	if (group != NULL) {
		/* get gid */
		gid = strtol(group, &end, 10);

		/* not numeric?  lookup as name */
		if (*end != 0) {
			grp = getgrnam(group);
			if (grp == NULL) {
				log_msg(LOG_ERROR, "drop_privileges(): group not found: %s\n", group);
				return -1;
			}
			gid = grp->gr_gid;
		}

		/* set real/effective gid */
		if (setregid(gid, gid)) {
			log_msg(LOG_ERROR, "drop_privileges(): setregid() failed: %s\n", strerror(errno));
			return -1;
		}

		log_msg(LOG_NOTICE, "changed gid to %d\n", gid);

		/* drop supplementary groups */
		if (setgroups(0, NULL)) {
			log_msg(LOG_ERROR, "drop_privileges(): setgroups() failed: %s\n", strerror(errno));
			return -1;
		}

		log_msg(LOG_NOTICE, "dropped supplementary groups\n");
	}

	/* handle group */
	if (user != NULL) {
		/* get gid */
		uid = strtol(user, &end, 10);

		/* not numeric?  lookup as name */
		if (*end != 0) {
			pwd = getpwnam(user);
			if (pwd == NULL) {
				log_msg(LOG_ERROR, "drop_privileges(): user not found: %s\n", group);
				return -1;
			}
			uid = pwd->pw_uid;
		}

		/* set real/effective gid */
		if (setreuid(uid, uid)) {
			log_msg(LOG_ERROR, "drop_privileges(): setreuid() failed: %s\n", strerror(errno));
			return -1;
		}

		log_msg(LOG_NOTICE, "changed UID to %d\n", uid);
	}

	return 0;
}

void
signal_sighup (int signal)
{
	reload_flag = 1;
}

void
signal_sigterm (int signal)
{
	shutdown_flag = 1;
}

int
main (int argc, char** argv)
{
	int sock;
	int err;
	struct pollfd sock_fd;
	struct sigaction sigact;
	FILE* pid;

	/* configuration */
	int port = DEFAULT_LISTEN_PORT;
	char* host = "0.0.0.0";
	char* host_list = DEFAULT_HOST_LIST;
	char* ban_list = DEFAULT_BAN_LIST;
	char* log_file = NULL;
	char* pid_file = NULL;
	int do_daemon = 0;
	int do_help = 0;
	char* user = NULL;
	char* group = NULL;

	/* hello! */
	printf("Telnet Proxy Daemon v%s\n", PROXY_VERSION);
	printf("Copyright (C) 2004  AwesomePlay Productions, Inc.\n");
	printf("See the file COPYING for license details.\n");

	/* options */
	struct Option options[] = {
		{ 0, "help", NULL, NULL, &do_help },
		{ 'd', "daemon", NULL, NULL, &do_daemon },
		{ 'p', "port", NULL, &port, NULL },
		{ 'l', "log", &log_file, NULL, NULL },
		{ 'H', "host", &host, NULL, NULL },
		{ 'h', "hostlist", &host_list, NULL, NULL },
		{ 'b', "banlist", &ban_list, NULL, NULL },
		{ 'w', "pid", &pid_file, NULL, NULL },
		{ 'c', "maxclients", NULL, &max_clients, NULL },
		{ 'm', "maxhost", NULL, &max_host_clients, NULL },
		{ 't', "ctime", NULL, &connect_timeout, NULL },
		{ 'a', "atime", NULL, &activity_timeout, NULL },
		{ 'u', "user", &user, NULL, NULL },
		{ 'g', "group", &group, NULL, NULL },
		{ 0, NULL, NULL, NULL, NULL }
	};

	/* parse options */
	if (parse_options(options, argc, argv) == -1)
		return 1;

	/* help? */
	if (do_help) {
		print_usage(argv[0], options);
		return 0;
	}

	/* open log file */
	if (log_open(log_file))
		return 1;

	/* verify port */
	if (port < 1 || port > UINT16_MAX) {
		log_msg(LOG_ERROR, "invalid port %d\n", port);
		return 1;
	}

	/* verify max clients */
	if (max_clients < 1) {
		log_msg(LOG_ERROR, "invalid client max %d\n", max_clients);
		return 1;
	}
	if (max_host_clients < 1) {
		log_msg(LOG_ERROR, "invalid client host max %d\n", max_host_clients);
		return 1;
	}

	/* verify timeouts */
	if (connect_timeout < 1) {
		log_msg(LOG_ERROR, "invalid connect timeout %d\n", connect_timeout);
		return 1;
	}
	if (activity_timeout < 1) {
		log_msg(LOG_ERROR, "invalid activity timeout %d\n", activity_timeout);
		return 1;
	}

	/* load initial set of valid hosts */
	if (allowed_servers_load(host_list))
		return 1;

	/* load initial set of banned clients */
	if (banned_clients_load(ban_list))
		return 1;

	/* do daemonization */
	if (do_daemon) {
		/* requires a log file */
		if (log_file == NULL) {
			log_msg(LOG_ERROR, "must specify a log file when using daemon mode\n");
			return 1;
		}

		/* fork */
		err = fork();
		if (err == -1) {
			log_msg(LOG_ERROR, "main(): fork() failed: %s\n", strerror(errno));
			return 1;
		}

		/* main process - exit */
		if (err != 0)
			return 0;

		/* close stdin, stdout, stderr */
		close(0);
		close(1);
		close(2);

		/* set session id */
		setsid();
	}

	/* create socket */
	sock = create_listen_socket(host, port);
	if (sock == -1)
		return 1;

	/* set signals */
	sigemptyset (&sigact.sa_mask);
	sigact.sa_flags = 0;
	sigact.sa_handler = SIG_IGN;
	sigaction(SIGPIPE, &sigact, NULL);
	sigact.sa_handler = signal_sighup;
	sigaction(SIGHUP, &sigact, NULL);
	sigact.sa_handler = signal_sigterm;
	sigaction(SIGTERM, &sigact, NULL);
	sigact.sa_handler = signal_sigterm;
	sigaction(SIGINT, &sigact, NULL);

	/* write pid file */
	if (pid_file != NULL) {
		pid = fopen(pid_file, "wt");
		if (pid == NULL) {
			log_msg(LOG_ERROR, "failed to open %s: %s\n", pid_file, strerror(errno));
			return 1;
		}
		fprintf(pid, "%d\n", getpid());
		fclose(pid);
	}

	/* drop privileges */
	if (drop_privileges(user, group))
		return 1;

	/* begin server loop */
	log_msg(LOG_NOTICE, "listening on port %s.%d\n", host, port);
	do {
		/* poll server socket(s) */
		sock_fd.fd = sock;
		sock_fd.events = POLLIN;
		sock_fd.revents = 0;
		err = poll(&sock_fd, 1, 1000); /* 1000 for DEBUG - set back to -1 */

		log_dbg("poll() for main: %d %hx %hx\n", err, sock_fd.revents, sock_fd.revents);

		/* check for error */
		if (err == -1 && errno != EINTR) {
			log_msg(LOG_WARNING, "main(): poll() failed: %s\n", strerror(errno));
			break;
		}

		/* reload data on SIGHUP */
		if (reload_flag) {
			reload_flag = 0;
			log_msg(LOG_NOTICE, "reloading host list\n");
			allowed_servers_load(host_list);
			log_msg(LOG_NOTICE, "reloading ban list\n");
			banned_clients_load(ban_list);
		}

		/* shutdown on SIGTERM */
		if (shutdown_flag) {
			log_msg(LOG_NOTICE, "received terminating signal\n");
			break;
		}

		/* something ready on socket */
		if (sock_fd.revents & POLLIN) {
			log_dbg("creating ipv4 client\n");

			create_client(sock_fd.fd);

			log_dbg("ipv4 client created\n");
		}

	} while(1);

	/* shutdown sockets */
	close(sock);

	/* unlink pid file */
	if (pid_file != NULL)
		unlink(pid_file);

	/* finish up */
	log_msg(LOG_NOTICE, "terminating proxy\n");
	log_close();

	return 0;
}
