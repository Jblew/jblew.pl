jMUD v0.6.7

By Stendec <stendec365@gmail.com>

Welcome to the beta version of jMUD, a MUD client that's implemented almost
entirely in JavaScript, only relying on a small Flash file for socket
functionality (as JavaScript doesn't have sockets).

jMUD has full support for ANSI and XTERM color sequences, including support
for background colors, and allows the use of ANSI escape codes to clear the
screen. In addition, using a plugin, jMUD has nearly full support for MXP,
only lacking support for line tags and the elements: <NOBR>, <P>, <SBR>,
<SOUND>, <MUSIC>, <GAUGE>, <STAT>, <FRAME>, <DEST>, <RELOCATE>, <USER>,
<PASSWORD>,  and <FILTER>. That seems like a lot, but it isn't that bad. I
might write frame support into a future version of jMUD, and things like
<RELOCATE> and <SOUND> / <MUSIC> can be implemented by the end user if needed
(a MSP plugin would be cool but I won't be the one to write it).

jMUD also handles telnet option negotiations, and currently has support for the
following options:

NAWS          Negotiate About Window Size             http://www.faqs.org/rfcs/rfc1073.html
TTYPE         Terminal Type                           http://www.faqs.org/rfcs/rfc1091.html
EOR           End of Record                           http://www.faqs.org/rfcs/rfc885.html
NEW-ENVIRON   Environment Variables                   http://www.faqs.org/rfcs/rfc1572.html
LINEMODE      Linemode, as opposed to character mode  http://www.faqs.org/rfcs/rfc1184.html
SUPPRESS-GA   Suppress Go Ahead                       http://www.faqs.org/rfcs/rfc858.html
ECHO          Server Echo                             http://www.faqs.org/rfcs/rfc857.html
MSDP          MUD Server Data Protocol                http://tintin.sourceforge.net/msdp/
MSSP          MUD Server Status Protocol              http://tintin.sourceforge.net/mssp/
MXP           MUD eXtension Protocol                  http://www.zuggsoft.com/zmud/mxp.htm

In addition, you can add support for your own telnet options using events. jMUD
will automatically refuse any telnet option that it doesn't recognize and that
isn't handled by an event handler.

jMUD works together with jQuery to make things as easy as possible for the end
developer, so if you've never used jQuery, I recommend reading up on it and its
tutorials.

See the provided HTML documents for examples on how to get started using jMUD.

Note: If you're trying to test jMUD in your browser using paths like file:///
you'll need to open the global security panel for Flash and add the path to
jsocket.swf as trusted, otherwise it won't be able to function and jMUD won't
connect.

===============================================================================
Use
===============================================================================
jMUD acts as a jQuery plugin and you can use it like most other jQuery plugins.
For the following examples, assume you're using an element with the ID
'mud-display' to display MUD output.

Setting up a basic MUD client is as simple as:

$("#mud-display").mud();

That will connect to the default port (4000) of whatever host the file is served
from. There's just one problem though... input. That's easy to fix though. If
you've got an <input type="text" /> element that you want to serve as MUD input,
just pass it to the mud during creation like:

$("#mud-display").mud({ 'id_input' : 'some-input-element'});

jMUD will catch input from that text box, and even replace it automatically with
an <input type="password" /> when local echo is disabled by the server to protect
your passwords.

As said though, that has to be used during MUD creation, otherwise it won't work.

If you don't want jMUD to manage its own input, you can still send input to the
MUD with:

$("#mud-display").mud().send("Some string here.");

The following functions are avaliable:
===============================================================================
.bind(type, [data], function)
                  Binds a handler to one or more events (like 'onReady'). See:
                  http://docs.jquery.com/Events/bind

.clear(key)       Clear the current output element. If key is given, clear the
                  output element with that key.

.connect()        If not connected, attempt to connect to the MUD.
.disconnect()     If connected, disconnect from the MUD.

.doNAWS()         Send an updated NAWS report to the server. You should call
                  this after doing something that causes the display element
                  to change size.

.doScroll(key)    Scroll the current output element to its end. If key is given,
                  scroll that output element.

.getSize(key)     Get the size of the current output element in cols and rows as
                  an associative array. If key is given, get the size of that
                  specific output element.
                  Usage: cols = $("#mud-display").mud().getSize().cols

.mssg(text, key, addLine)
                  Append a string to the current output element. If key is given,
                  output to that output element. If addLine is false, a blank
                  line will not be added before the message in the event that it
                  would be necessary to start the message on a new line.

.resetState()     Reset the internal state variables.

.send(text, skipEvent, quiet)
                  Send player input to the MUD. If skipEvent is true, no events
                  will be generated sending the text. If quiet is true, the text
                  won't be echoed to the client, even with local echo enabled.

.sendIAC(data)    Send an IAC sequence to the MUD. If debugtelnet is true, print
                  it to the output display in a human readable format.

.setOutput(key, element, use, lock)
                  Specify a new input element for jMUD to use to be accessed
                  with the given key. Key should be a string. If no element
                  is given, it will delete that input element. If use is true,
                  jMUD will immediately start using the element for output. If
                  lock is true, the element will become the new default until
                  it is overridden by a new setOutput or a useOutput with
                  lock set to true.

.setTitle(text)   Set title text. This is the function used internally when a
                  window title sequence is recieved.

.setVariable(n,v) Set a new variable, accessible via .variables. This function
                  also raises the onVarChange event if necessary and is the
                  recommended way of setting variables.

.useOutput(key, lock)
                  Switch to using the specified output element. If lock isn't
                  true, jMUD will switch back at the end of the current line.
                  If lock is true, the specified output element will become the
                  new default and will be used until the default is changed
                  via setOutput or useOutput.
                  
                  To switch to the main output element, specify key = null
===============================================================================

Also, the following properties are available:
===============================================================================
.connected        True if jMUD is connected, else false.
.connecting       True if jMUD is trying to connect, else false.
.plugins          A simple array of all loaded plugins.
.ready            True once jMUD is ready with a loaded socket, else false.
.socket           The jSocket object behind jMUD.
.telopt           An associative array of various special telnet bytes. This is
                  used by the telnet core to make things a bit more readable.
.variables        An associative array of all variables recieved via MSDP or
                  NEW-ENVIRON.
.version          The version of jMUD as a string. Example: "0.5"
===============================================================================

Getting back to creating the mud though, .mud() has one optional argument, an array
of options, done the usual jQuery way. There's a list of those options below, or
in a huge comment above the .mud() function in jquery.mud.js.

===============================================================================
.mud() Avaliable Options
===============================================================================
Options allow you to customize basic behaviors of jMUD. To use an option,
specify it while you're creating the jMUD object like you would an array
of options for any other jQuery plugin. See an example for more info.

hostname        String. The remote host to connect to.
port            Integer. The port to access on the remote host.
policyport      Integer. The port to retrieve the flash policy file from,
                if one is not avaliable at port 843.

swflocation     String. Location of jsocket.swf, relative to the page.

autostart       Boolean. If true, jMUD will attempt to connect as soon as
                the socket is ready.

connectonsend   Boolean. If true, jMUD will attempt to connect if the user
                tries to send text while disconnected.

autoreconnect   Boolean. If true, jMUD will automatically attempt to
                reconnect when the connection is lost.

reconnectdelay  Integer. The amount of time, in milliseconds, for jMUD to
                wait before attempting to reconnect.

reconnecttries  Integer. The number of times to attempt to reconnect before
                giving up.

inputfg         String. The foreground color to use for displaying player
                input. The fgclass is prepended to this value. So, if you
                set fgclass to 'c' and this to '7', the class on player
                input will be 'c7'. For bright yellow use '11'.

inputbg         String. The background color to use for displaying player
                input. The bgclass is prepended to this value. So, if you
                set bgclass to 'b' and this to '0', the class on player
                input will be 'b0'. For black, use '0'.

cmdhistory      Boolean. If true and jMUD is managing user input, pressing
                up and down will cycle through a history of recently used
                commands.

cmdhistorysize  Integer. The number of recently used commands to remember.

multiline       Boolean. If true and jMUD is managing user input, pressing
                Ctrl+Enter will add a new line to the input box, letting the
                user enter multiple lines of commands.

clearonsend     Boolean. If true and jMUD is managing user input, the input
                element's value will be cleared when you send text. Otherwise
                its text will be highlighted.

windowtitle     Boolean. If true, when a title string is recieved it will
                be set to the document's title.

id_socket       String. ID of the element to store the flash socket in. If
                unspecified, one will be created.

id_title        String. If specified, when a title string is recieved it
                will be set to the element with the provided ID.

id_input        String. If specified, jMUD will use the element with the
                provided ID for player input, automating the process.

blurclass       String. Class that will be applied to a managed input
                element when it has default text. Generally, this is used
                to dim initial 'Type here and press enter to connect.'
                messages.

connectmessage  String. A message to display in the managed input element
                when it's empty and jMUD is disconnected.

emptymessage    String. A message to display in the managed input element
                when it's empty and jMUD is connected to a MUD.

handleclear     Boolean. If true, jMUD will clear the output buffer when it
                recieves an ANSI escape code to clear.

handlecolor     Boolean. If true, jMUD will process ANSI and XTERM color
                sequences. Else they're ignored.

fgclass         String. Prefix of foreground colorization classes for jMUD
                output. Defaults to 'c', resulting in classes like 'c25'

bgclass         String. Prefix of background colorization classes for jMUD
                output. Defaults to 'b', resulting in classes like 'b29'

debugtelnet     Boolean. If true, telnet sequences will be written to the
                output buffer in a human-readable format.

ttypes          Array of Strings. The list of possible TTYPEs that jMUD
                will report from when requested by the server.

environ         Associative Array. The list of variables that jMUD will
                report when requested by the server with NEW-ENVIRON.

plugin_order    Array of Strings. The order in which jMUD should attempt
                to load its available plugins. This will let you be sure
                to load plugins after their dependencies are already in.

===============================================================================
.mud() Avaliable Events
===============================================================================
Events are attached to the display element used by jMUD. However, you may
attach events to the jMUD object directly. To capture an event, use
jQuery's .bind() function. For example, to bind a function for the
'onIACECHO' event, assuming your jMUD object is stored in a variable named
'jmud', use the following:

jmud.bind('onIACECHO', function(e) { /* code here */ });


processRecieved   Event called when data is recieved before any processing
                  is performed.
Properties:
  e.jmud          jMUD Instance.
  e.text          String. The raw recieved data.


processOutput     Event called before plain text is output to the display.
                  You can use this for any custom processing of text, along
                  with processRecieved.
Properties:
  e.jmud          jMUD Instance.
  e.text          String. The raw data that will be added to the display.


onText            Event called when a line of text is ready to be displayed.
                  This can be used for setting up triggers or gagging
                  certain lines, as shown in index.html.
Properties:
  e.jmud          jMUD Instance.
  e.text          The plain text of the line.
  e.html          The text with HTML (color codes mainly) still included.


onFinalText       Event called after text is sent to the display element.
                  This is useful for attaching events to any elements you
                  create if necessary.
Properties:
  e.jmud          jMUD Instance.
  e.element       DOM Element. The element containing the latest displayed
                  text.


onSendCommand     Event called when a command is to be sent to the server.
Properties:
  e.jmud          jMUD Instance.
  e.text          String. The command (without trailing linebreak).


onIACECHO         Event called when local ECHO is enabled or disabled. Used
                  for making an input element use type="password".
Properties:
  e.jmud          jMUD Instance.
  e.echo          Boolean. True if the client should echo user input, false
                  if the server will.


onIACSwitch       Event called when an unrecognized IAC sequence of
                  IAC DO/DONT/WILL/WONT <option> sequence is recieved.
Properties:
  e.jmud          jMUD Instance.
  e.raw           String. The raw IAC sequence as a string.
  e.option        String. Character identifying the telnet option in question.
  e.action        String. Character that's one of:  DO, DONT, WILL, WONT


onIACSubneg       Event called when an IAC SB <option> <data> IAC SE sequence
                  is recieved.
Properties:
  e.jmud          jMUD Instance.
  e.raw           String. The raw IAC sequence as a string.
  e.option        String. Character identifying the telnet option in question.
  e.text          String. The text of the subnegotiation, excluding the
                  initial IAC SB <option>, as well as the ending IAC SE.


onANSI            Event called when an unrecognized ANSI escape sequence is
                  recieved.
Properties:
  e.jmud          jMUD Instance.
  e.raw           String. The raw ANSI sequence as a string.


onVarChange       Event called when a variable recieved from the MUD via MSDP
                  or NEW-ENVIRON.
Properties:
  e.jmud          jMUD Instance.
  e.key           String. Name of the variable in question.
  e.value         Object. The variable's new value. Either an array or
                  string.


onReady           Event called when the jMUD socket is ready.
Properties:
  e.jmud          jMUD Instance.


onConnected       Event called when jMUD has connected successfully.
Properties:
  e.jmud          jMUD Instance.


onDisconnected    Event called when jMUD has been disconnected.
Properties:
  e.jmud          jMUD Instance.

===============================================================================
Plugins
===============================================================================
Plugins with jMUD are easy. Just look at jmud.command.js if you want an example
of how to implement a plugin without getting too overwhelmed by source code.

Basically, jMUD will load all the available plugins when you create an instance
so there's no hassle. You can specify options to pass to the plugin with an
entry in options with a key of the plugin's name. You'll want to pass an
associative array (or dict, whatever you call it).

If, for some reason, you don't want jMUD to load an available plugin, add an
entry for it to options, but instead of a dict make it the boolean value false.
Example:

options = { 'command' : false, }

That would stop it from loading the command plugin. Simple, right? Good. There's
also a plugin_order option to let you specify the order plugins are loaded in.

Plugins are powerful. MXP is implemented as a plugin, so that should let you
know how much you can do with a simple plugin.

===============================================================================
Included Stuff
===============================================================================
Readme.txt                    This file.
License.txt                   All that annoying legal crap.

index.html                    The index from the website.
example-basic.html            Basic implementation example.
example-event.html            Example of using events.
example-split.html            More than one jMUD per page. Awesomeness.
example-command.html          An example of sending options to a plugin, and of
                              the command plugin.
example-mxp.html              An example of loading the MXP plugin, but not that
                              useful or demonstrative unless you have an MXP
                              enabled MUD to test it against.
example-zmp.html              An example of using the ZMP plugin and defining
                              custom commands.

jSocket.as                    Source code for the flash socket.

media/jsocket.swf             The Flash socket interface. This is modified
                              from the original jSocket, fixing a few issues
                              for MUD use, like an annoying inability to send
                              \x00 bytes to JavaScript.

media/css/layout.css          CSS to go with the provided examples.
media/css/mud-colors.css      Classes for colorization of text in jMUD.
media/css/mud-mxp.css         Some basic styling for MXP tags.

media/images/external.png     External Link image for mud-mxp.css

media/js/jquery.js            jQuery Itself
media/js/jsocket.js           The jSocket package. This has been modified to
                              work with the changes to jsocket.swf.
media/js/xregexp-min.js       A regular expression helper to make things go
                              smoothly across browsers, not to mention improve
                              the ease of regex use in general.
                              
media/js/jquery.mud.js        jMUD itself. This is where the magic happens.
media/js/jmud.command.js      jMUD Plugin: Command Core. Useful for client-side
                              command implementation.
media/js/jmud.mxp.js          jMUD Plugin: MXP Processor. Adds MXP support to
                              jMUD with support for most tags.
media/js/jmud.zmp.js          jMUD Plugin: ZMP Core. Adds ZMP support to jMUD
                              with an easy way to add your own functions.

flash policy/flashpolicy.xml  Example flash policy file
flash policy/flashpolicyd.py  Example flash policy daemon, written in python

===============================================================================
Installation
===============================================================================
Copy all the files in media/ to your server and set up the HTML page that will
host jMUD. See the examples for demonstration on how to get started.

===============================================================================
Requirements
===============================================================================
As this uses Flash for a socket, you'll need to deal with all that flash policy
file nonsense. You need a valid policy file on your server to allow flash to
connect.

If you don't have a flash policy server thingy already, there's a python script
included that will serve them, as well as an example policy XML file. Remember
when you're editing the policy file to use the EXACT domain your flash file will
be served from. No leaving off things like 'www.'

===============================================================================
Change Log
===============================================================================
2009-09-28 - v0.6.7 - Fixed: Cleaned extra commas out of the code that was
                             erroring out old versions of Internet Explorer.
                      Added: jMUD will show a message if it detects the user is
                             using an old version of Internet Explorer since
                             it only works in IE8+. The older ones have bad JS
                             handling that eats newlines.

2009-09-27 - v0.6.6 - Added: jMUD now shows a message if the socket hasn't
                             loaded in 2.5 seconds, alterting the user that the
                             socket hasn't loaded. Otherwise it would just sit
                             at an unchanged window and make you wonder if it
                             was broken or not.
                      Fixed: Changed how jMUD's socket reads data to hopefully
                             fix an issue with it assuming certain sequences
                             are unicode data.
                      Other: Created a project for jMUD on bitbucket in
                             anticipation of the much larger jMUD v0.7 release.

2009-09-22 - v0.6.5 - Added: jMUD managed input now supports multi-line input
                             via Ctrl+Enter.
                      Added: ANSI support handles codes for italic, negative,
                             single underline, and blink.
                      Added Options: inputfg, inputbg, clearonsend, multiline

2009-09-22 - v0.6.2 - Fixed: A bug preventing the socket from sending output to
                             the mud in Linux.
                      Fixed: Right-click MXP menus should now work in Firefox,
                             Internet Explorer, Chrome, and Safari. Others are
                             untested.

2009-09-21 - v0.6.1 - Fixed: An issue not letting you have a key of 'null' in
                             associative arrays.

2009-09-20 - v0.6.0 - Added Plugin: ZMP Processor
                      Added Methods: setOutput, useOutput
                      Added Option: plugin_order
                      Changed: Rewrote output code to let you have multiple output
                               elements and easilly switch between them.

2009-09-19 - v0.5.0 - Added Plugin: MXP Processor
                      Added Event: onFinalText
                      Added Method: setVariable
                      Fixed: Cleaned up global variables into the jMUD namespace.

2009-09-17 - v0.4.0 - Added Plugin Support
                      Added Plugin: Command Core
                      Added Events: onText, onANSI
                      Fixed: Made .mssg() prepend a new line if needed to start
                             on a new line.

2009-09-16 - v0.3.0 - Initial Important Release

Comments, critiques, random conversations about goldfish (not really)... have
something to say? E-mail me. I can also be reached at stendec365 on AIM.

~Stendec~