VERSION:=0.01

all: TelnetApplet.jar

clean:
	rm -f *.class *.jar

TelnetApplet.jar: TelnetConnectorApplet.java TelnetSelectorThread.java
	/usr/jdk1.5.0_04/bin/javac -source 1.3 -target 1.1 -cp /usr/jdk1.5.0_04/jre/lib/plugin.jar TelnetConnectorApplet.java TelnetSelectorThread.java
	/usr/jdk1.5.0_04/bin/jar cf TelnetApplet.jar TelnetConnectorApplet.class TelnetSelectorThread.class

dist: TelnetApplet.jar
	mkdir cloud9-$(VERSION)/
	cp -f TelnetApplet.jar TelnetConnectorApplet.java TelnetSelectorThread.java Makefile README telnet.html LICENSE cloud9-$(VERSION)/
	tar -zcf cloud9-$(VERSION).tar.gz cloud9-$(VERSION)/
	rm -fr cloud9-$(VERSION)/
