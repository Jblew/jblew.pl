// Cloud9 MUD Client
// Copyright (c) 2005  AwesomePlay Productions, Inc. and
// contributors.  All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//  * Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
// DAMAGE.

import netscape.javascript.*;
import java.applet.*;
import java.net.*;
import java.io.*;
import java.nio.*;
import java.nio.channels.*;
import java.nio.charset.*;
import java.util.*;

public class TelnetConnectorApplet extends Applet {
	private JSObject window;
	private Selector ss;
	private TelnetSelectorThread st;
	private SocketChannel channel;
	private ByteBuffer outputBuffer;
	private ByteBuffer decodeBuffer;
	private ByteBuffer ansiBuffer;
	private ByteBuffer subreqBuffer;
	private ByteBuffer inputBuffer;
	private int mode;
	private StringBuffer displayBuffer;
	private String curColor;
	private String lastColor;
	private boolean willEcho;
	private boolean enableDebug;
	private Charset utf8;
	private CharsetDecoder decoder;

	final int MODE_TEXT = 0;
	final int MODE_ANSI = 1;
	final int MODE_IAC = 2;
	final int MODE_WILL = 3;
	final int MODE_WONT = 4;
	final int MODE_DO = 5;
	final int MODE_DONT = 6;
	final int MODE_SUB = 7;
	final int MODE_SUBIAC = 8;
	final int MODE_ANSI_SUB = 9;

	final byte TELNET_IAC = (byte)255;
	final byte TELNET_DONT = (byte)254;
	final byte TELNET_DO = (byte)253;
	final byte TELNET_WONT = (byte)252;
	final byte TELNET_WILL = (byte)251;
	final byte TELNET_SB = (byte)250;
	final byte TELNET_SE = (byte)240;

	final byte TELOPT_ECHO = (byte)1;
	final byte TELOPT_ZMP = (byte)93;

	public void init () {
		window = JSObject.getWindow(this);

		try {
			ss = Selector.open();
		} catch (IOException e) {
			errorMsg("Selector.open() failed: " + e.getMessage());
		}

		displayBuffer = new StringBuffer(1024);
		outputBuffer = ByteBuffer.allocateDirect(1024);
		decodeBuffer = ByteBuffer.allocateDirect(1024);
		ansiBuffer = ByteBuffer.allocateDirect(64);
		subreqBuffer = ByteBuffer.allocateDirect(1024 * 16);
		inputBuffer = ByteBuffer.allocateDirect(1024 * 16);

		try {
			utf8 = Charset.forName("UTF-8");
			decoder = utf8.newDecoder();
		} catch (UnsupportedCharsetException e) {
			// can't happen
		}

		// get debug set
		if (getParameter("debug").equals("true"))
			enableDebug = true;

		// tell JavaScript that we're ready
		connect(getParameter("host"), Integer.parseInt(getParameter("port")));
	}

	public boolean isConnected () {
		return channel != null;
	}

	public boolean connect (String host, int port) {
		disconnect();

		// make connection
		try {
			InetSocketAddress isa = new InetSocketAddress(InetAddress.getByName(host), port);
			channel = SocketChannel.open(isa);
			channel.configureBlocking(false);
			channel.register(ss, SelectionKey.OP_READ);
		} catch (IOException e) {
			errorMsg("Couldn't get I/O for the connection to: " + host + ": " + e.getMessage());
			return false;
		}

		// selector thread
		st = new TelnetSelectorThread(this, ss);
		st.start();

		// notify JavaScript
		Object[] args = { host, new Integer(port) };
		window.call("onConnect", args);

		// res of setup
		mode = MODE_TEXT;
		curColor = null;
		lastColor = null;
		willEcho = true;

		return true;
	}

	public void disconnect () {
		if (isConnected()) {
			try {
				// selector thread
				st.stop();
				st = null;

				// shutdown
				channel.close();

				// clean up
				channel = null;
				decodeBuffer.clear();
				outputBuffer.clear();
			} catch (IOException e) {
			}

			// notify JavaScript
			Object[] args = {};
			window.call("onDisconnect", args);
		}
	}

	public boolean sendLine (String text) {
		byte nl = '\n';

		if (!isConnected())
			return false;

		ByteBuffer bytes = utf8.encode(text);

		byte b;
		while (bytes.hasRemaining()) {
			b = bytes.get();
			if (b == TELNET_IAC) // double IAC byte
				addOutputByte(b);
			addOutputByte(b);
		}

		addOutputByte(nl);
		flushOutput();

		return true;
	}

	private void addOutputByte (byte b) {
		outputBuffer.put(b);

		if (!outputBuffer.hasRemaining())
			flushOutput();
	}

	private void flushOutput () {
		try {
			outputBuffer.flip();
			channel.write(outputBuffer);
			outputBuffer.compact();
		} catch (IOException e) {
			errorMsg("channel.write(outputBuffer) failed:" + e.getMessage());
			disconnect();
		}
	}

	private void sendTelopt (byte mode, byte opt) {
		byte[] buffer = { TELNET_IAC, mode, opt };

		if (enableDebug) {
			String msg = "SENT: IAC ";
			switch(mode) {
				case TELNET_DO: msg += "DO"; break;
				case TELNET_DONT: msg += "DONT"; break;
				case TELNET_WILL: msg += "WILL"; break;
				case TELNET_WONT: msg += "WONT"; break;
			}
			debugMsg(msg + " " + opt);
		}
		
		addOutputByte(TELNET_IAC);
		addOutputByte(mode);
		addOutputByte(opt);
		flushOutput();
	}

	public boolean sendZMP (String[] args) {
		if (!isConnected())
			return false;

		addOutputByte(TELNET_IAC);
		addOutputByte(TELNET_SB);
		addOutputByte(TELOPT_ZMP);
		for(int i = 0; i < args.length; ++i) {
			ByteBuffer bytes = utf8.encode(args[i]);

			byte b;
			while (bytes.hasRemaining()) {
				b = bytes.get();
				if (b == TELNET_IAC) // double IAC byte
					addOutputByte(b);
				addOutputByte(b);
			}

			addOutputByte((byte)0);
		}
		addOutputByte(TELNET_IAC);
		addOutputByte(TELNET_SE);

		flushOutput();

		return false;
	}

	public void handleInput () {
		inputBuffer.clear();
		try {
			if (channel.read(inputBuffer) == -1) {
				debugMsg("Server disconnected.");
				disconnect();
				return;
			}
			inputBuffer.flip();
		} catch (IOException e) {
			errorMsg("channel.read(inputBuffer) failed: " + e.getMessage());
			disconnect();
			return;
		}

		// process inputBuffer
		byte c;
		while (inputBuffer.hasRemaining()) {
			c = inputBuffer.get();
			switch (mode) {
				case MODE_TEXT: {
					// beginning of IAC sequence
					if (c == TELNET_IAC) {
						mode = MODE_IAC;

					// beginning of ANSI sequence
					} else if (c == 27) {
						ansiBuffer.clear();
						flushDecode();
						mode = MODE_ANSI;

					// text
					} else {
						addDecodeByte(c);
					}

					break;
				}
				case MODE_ANSI: {
					if (c == '[') {
						mode = MODE_ANSI_SUB;
					} else {
						parseAnsi(c);
						mode = MODE_TEXT;
					}
					break;
				}
				case MODE_ANSI_SUB: {
					// letter marks end
					if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
						ansiBuffer.flip();
						parseAnsi(c);
						mode = MODE_TEXT;
					} else {
						try {
							ansiBuffer.put(c);
						} catch (BufferOverflowException e) {
							// ignore; what else should we do?
						}
					}
					break;
				}
				case MODE_IAC: {
					if (c == TELNET_DO)
						mode = MODE_DO;
					else if (c == TELNET_DONT)
						mode = MODE_DONT;
					else if (c == TELNET_WILL)
						mode = MODE_WILL;
					else if (c == TELNET_WONT)
						mode = MODE_WONT;
					else if (c == TELNET_SB) {
						mode = MODE_SUB;
						subreqBuffer.clear();
					} else { // includes IAC IAC
						addDecodeByte(c);
						mode = MODE_TEXT;
					}
					break;
				}
				case MODE_DO: {
					mode = MODE_TEXT;

					debugMsg("RECV: IAC DO " + c);

					sendTelopt(TELNET_WONT, c);
					break;
				}
				case MODE_DONT: {
					mode = MODE_TEXT;

					debugMsg("RECV: IAC DONT " + c);

					break;
				}
				case MODE_WILL: {
					mode = MODE_TEXT;

					debugMsg("RECV: IAC WILL " + c);

					if (c == TELOPT_ECHO)
						setEcho(false);
					else if (c == TELOPT_ZMP)
						enableZMP();
					else
						sendTelopt(TELNET_DONT, c);
					break;
				}
				case MODE_WONT: {
					mode = MODE_TEXT;

					debugMsg("RECV: IAC WONT " + c);

					if (c == TELOPT_ECHO)
						setEcho(true);
					break;
				}
				case MODE_SUB: {
					if (c == TELNET_IAC) {
						mode = MODE_SUBIAC;
					} else {
						try {
							subreqBuffer.put(c);
						} catch (BufferOverflowException e) {
							// too much data for buffer... disconnect
							errorMsg("Telnet sub-request buffer overflow.");
							disconnect();
						}
					}
					break;
				}
				case MODE_SUBIAC: {
					if (c == TELNET_IAC) {
						errorMsg("IAC IAC");
						try {
							subreqBuffer.put(TELNET_IAC);
						} catch (BufferOverflowException e) {
							// too much data for buffer... disconnect
							errorMsg("Telnet sub-request buffer overflow.");
							disconnect();
						}
						mode = TELNET_IAC;
					} else if (c == TELNET_SE) {
						subreqBuffer.flip();
						processSubrequest();
						mode = MODE_TEXT;
					}
					break;
				}
				default: {
					mode = MODE_TEXT;
					break;
				}
			}
		}

		// flush
		flushDisplay();
	}

	private void processSubrequest () {
		// sub-request with no option code; error
		if (!subreqBuffer.hasRemaining()) {
			debugMsg("Telnet sub-request has no option code.");
			return;
		}

		byte command = subreqBuffer.get();
		switch (command) {
			case TELOPT_ZMP:
				processZMP();
				break;
			default:
				// do nothing
				break;
		}
	}

	private void enableZMP () {
		// tell server to do ZMP
		sendTelopt(TELNET_DO, TELOPT_ZMP);

		// tell JavaScript about ZMP
		Object[] args = {};
		window.call("enableZMP", args);
	}

	private void processZMP () {
		// basic sanity-checking
		if (subreqBuffer.limit() < 2) {
			debugMsg("ZMP command less than two bytes long.");
			return;
		}
		if (subreqBuffer.get(subreqBuffer.limit() - 1) != (byte)0) {
			debugMsg("ZMP command last byte is not a NUL byte.");
			return;
		}

		// count args
		int argc = 0;
		for (int i = 0; i < subreqBuffer.limit(); ++i)
			if (subreqBuffer.get(i) == (byte)0)
				++argc;

		debugMsg("ARGC: " + argc);

		// break input into string args
		String[] argv = new String[argc];
		int start = 1;
		argc = 0;
		while (start < subreqBuffer.limit()) {
			int i = start;
			while (subreqBuffer.get(i) != 0)
				++i;
			ByteBuffer slice = subreqBuffer.slice();
			slice.limit(i - 1);
			slice.position(start - 1);
			debugMsg("Slice: " + slice.position() + " " + slice.limit() + " " + i + " " + start);
			argv[argc++] = utf8.decode(slice).toString();
			debugMsg("ARG: " + argv[argc - 1]);
			start = i + 1;
		}
		subreqBuffer.clear();

		// must ensure all received input is dumped as appropriate
		flushDisplay();

		// tell JavaScript about the request
		Object[] args = { new Integer(argc), argv };
		window.call("onZMP", args);
	}

	private void clearScreen () {
		// flush any pending output first
		flushDisplay();

		// and clear screen
		Object[] args = {};
		window.call("clearScreen", args);
	}

	private void setAnsiColor (int color) {
		switch (color) {
			// default
			case 0:
				curColor = null;
				break;
			// black
			case 30:
				curColor = "black";
				break;
			// red
			case 31:
				curColor = "red";
				break;
			// green
			case 32:
				curColor = "green";
				break;
			// yellow (brown)
			case 33:
				curColor = "yellow";
				break;
			// blue
			case 34:
				curColor = "blue";
				break;
			// magenta 
			case 35:
				curColor = "magenta";
				break;
			// cyan
			case 36:
				curColor = "cyan";
				break;
			// grey
			case 37:
				curColor = "grey";
				break;
			default:
				curColor = null;
				break;
		}
	}

	private void parseAnsi (byte command) {
		switch (command) {
			// clear the screen
			case 'J':
				clearScreen();
				break;
			// color mode
			case 'm':
				try {
					String colors = utf8.decode(ansiBuffer).toString();
					StringTokenizer tok = new StringTokenizer(colors, ";");
					while (tok.hasMoreTokens()) {
						int c = Integer.parseInt(tok.nextToken());
						setAnsiColor(c);
					}
				} catch (NumberFormatException e) {
					// ignore invalid color code
				}
				break;
			// unknown
			default:
				break;
		}
	}

	private void addDecodeByte (byte c) {
		decodeBuffer.put(c);

		if (!decodeBuffer.hasRemaining())
			flushDecode();
	}

	private void flushDecode () {
		CharBuffer chars = CharBuffer.allocate(1024);
		decodeBuffer.flip();
		while (decoder.decode(decodeBuffer, chars, false) == CoderResult.OVERFLOW) {
			displayText(chars.toString());
			chars.clear();
		}
		decodeBuffer.compact();
		chars.flip();
		if (chars.remaining() > 0) {
			displayText(chars.toString());
		}
	}

	private void displayText (String text) {
		// set color
		if (curColor != lastColor) {
			if (lastColor != null)
				displayBuffer.append("</span>");
			if (curColor != null) {
				displayBuffer.append("<span class=\"ansi_");
				displayBuffer.append(curColor);
				displayBuffer.append("\">");
			}
			lastColor = curColor;
		}

		// sanitize output
		char c;
		for (int i = 0; i < text.length(); ++i) {
			c = text.charAt(i);
			if (c == '<')
				displayBuffer.append("&lt;");
			else if (c == '>')
				displayBuffer.append("&gt;");
			else if (c == '&')
				displayBuffer.append("&amp;");
			else if (c == 13)
				; // do nothing
			else
				displayBuffer.append(c);
		}
	}

	private void flushDisplay () {
		flushDecode();
		
		// append </span>
		if (curColor != null) {
			displayBuffer.append("</span>");
			lastColor = null;
		}

		// send
		Object[] args = { displayBuffer.toString() };
		window.call("onDisplay", args);

		// reset buffer (MS JVM doesn't have delete() method)
		displayBuffer = new StringBuffer();
	}

	private void errorMsg (String text) {
		Object[] args = { text };
		window.call("onError", args);
	}

	private void debugMsg (String text) {
		if (enableDebug) {
			Object[] args = { text };
			window.call("onDebug", args);
		}
	}

	private void setEcho (boolean value) {
		if (value != willEcho) {
			debugMsg("ECHO: " + value);
			willEcho = value;
			sendTelopt(value ? TELNET_DONT : TELNET_DO, TELOPT_ECHO);
			Object[] args = { value ? "true" : "false" };
			window.call("setEcho", args);
		}
	}
}
