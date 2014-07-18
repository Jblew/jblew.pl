PROXY_VERSION := 0.92

all: proxy proxy-debug

proxy: proxy.c Makefile
	gcc -Wall -O2 -o proxy -DPROXY_VERSION='"$(PROXY_VERSION)"' -DNDEBUG proxy.c -lpthread && strip proxy

proxy-debug: proxy.c Makefile
	gcc -Wall -O0 -g -o proxy-debug -DPROXY_VERSION='"$(PROXY_VERSION)"' proxy.c -lpthread

clean:
	rm -f proxy proxy-debug

dist:
	mkdir proxy-$(PROXY_VERSION)
	cp proxy.c Makefile README COPYING hosts.txt deny.txt ChangeLog proxy-$(PROXY_VERSION)/
	tar -zcf proxy-$(PROXY_VERSION).tgz proxy-$(PROXY_VERSION)/
	rm -fr proxy-$(PROXY_VERSION)/
