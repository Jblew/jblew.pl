/*
  jMUD v0.6.6
  
  By: Stendec <stendec365@gmail.com>
  
  Copyright (c) 2009 Stendec <stendec365@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */

// Extend the array prototype for array comparison
if (!Array.prototype.compare) {
  Array.prototype.compare = function(testArr) {
    if (testArr === undefined) return false;
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { 
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
  };
}
if (!Array.prototype.contains) {
  Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
      if (this[i] === obj)
        return i;
    }
    return false;
  };
}
if (!Array.prototype.removeItem) {
  Array.prototype.removeItem = function(obj) {
    var i = this.length;
    while (i--) {
      if (this[i] === obj)
        this.splice(i,1);
        return true;
    }
    return false;
  };
}

// Extend the string prototype so we can use substr_count, endsWith, and htmlspecialchars .
if (!String.prototype.substr_count) {
  String.prototype.substr_count = function(text) {
    var cnt = 0;
    var i = this.indexOf(text);
    while (i != -1) {
      cnt++;
      i = this.indexOf(text, i+1);
    }
    return cnt;
  };
}
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(suffix) {
    var startPos = this.length - suffix.length;
    if (startPos < 0)
      return false;
    return (this.lastIndexOf(suffix, startPos) == startPos);
  };
}
if (!String.prototype.htmlspecialchars) {
  String.prototype.htmlcharhash = { '\r' : '', '\x08' : '', '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', ' ' : '&nbsp;', '\n' : '<br />' };
  String.prototype.htmlspecialchars = function() {
    return this.replace(/[\r\x08&<> \n]/g, function ($0) { return String.prototype.htmlcharhash[$0]; }).replace(/[\x00-\x1F]/,'');
  };
}
if (!String.prototype.undohtml) {
  String.prototype.htmlundo = { '&lt;' : '<', '&gt;' : '>', '&nbsp;' : ' ', '&amp;' : '&' };
  String.prototype.htmlrem = XRegExp('</span><span class="[^"]*">', 'g');
  String.prototype.undohtml = function() {
    return this.replace(String.prototype.htmlrem, '').replace(/&nbsp;/g,' ');
  };
}
if (!jQuery.fn.caret) {
  jQuery.fn.caret = function(begin, end) {
    if (this.length == 0) return;
    if (typeof begin == 'number') {
      end = (typeof end == 'number') ? end : begin;
      return this.each(function() {
        if (this.setSelectionRange) {
          this.focus();
          this.setSelectionRange(begin, end);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', begin);
          range.select();
        }
      });
    } else {
      if (this[0].setSelectionRange) {
        begin = this[0].selectionStart;
        end = this[0].selectionEnd;
      } else if (document.selection && document.selection.createRange) {
        var range = document.selection.createRange();
        begin = 0 - range.duplicate().moveStart('character', -100000);
        end = begin + range.text.length;
      }
      return { begin: begin, end: end };
    }
  };
}

// TELNET Constants
jMUD.prototype.telopt = {
  'IAC'     : String.fromCharCode(255),
  'DO'      : String.fromCharCode(253),
  'DONT'    : String.fromCharCode(254),
  'WILL'    : String.fromCharCode(251),
  'WONT'    : String.fromCharCode(252),
  'SB'      : String.fromCharCode(250),
  'SE'      : String.fromCharCode(240),
  'NEWENV'  : String.fromCharCode(39),
  'NAWS'    : String.fromCharCode(31),
  'TTYPE'   : String.fromCharCode(24),
  'IS'      : String.fromCharCode(0),
  'EOR'     : String.fromCharCode(25),
  'EORc'    : String.fromCharCode(239),
  'ECHO'    : String.fromCharCode(1),
  'MSSP_VAL': String.fromCharCode(2),
  'SUPGA'   : String.fromCharCode(3),
  'GA'      : String.fromCharCode(249),
  'LINEMODE': '"',
  'MSDP'    : 'E',
  'MSSP'    : 'F',
  'MSP'     : 'Z',
  'MXP'     : '[',
  'ESC'     : String.fromCharCode(27),
  'CR'      : String.fromCharCode(13),
  'LF'      : String.fromCharCode(10)
};

// Regular Expression for parsing incoming data stream.
jMUD.prototype.preg        = XRegExp("([^\\xFF\\x1B\\n]*)((?:\\xFF[\\xFB\\xFC\\xFD\\xFE].|\\xFF\\xFA.*?\\xFF\\xF0|\\xFF.|\\x1B\\][^\\x1b\\x07]*?(?:\\x07|\\x1B\\\\)|\\x1b.*?[A-Za-z]|\\n)?)","sg");

// Regular Expression for parsing MSDP data.
jMUD.prototype.msdp_reg    = XRegExp("\\x01([^\\x02]*)((?:\\x02[^\\x01\\x02]*)+)","g");

// Regular Expressions for dealing with NEW-ENVIRON data.
jMUD.prototype.newenv_reg  = XRegExp("([\\x00\\x03]*)([^\\x00\\x03]*)","g");
jMUD.prototype.neweni_reg  = XRegExp("([\\x00\\x03])([^\\x01]*)\\x01([^\\x00\\x01\\x03\\xFF]*)","g");

/* Convert a IAC sequence to something human readable for debugging. */
jMUD.prototype.debugIAC = function(c, out) {
  if(!out)
    out = 'RCVD';
  
  var t = this.telopt;
  
  var is_sb = false;
  var sb_type = null;
  var open = false;
  for(n = 0; n < c.length; n++)
  {
    if (sb_type != t.LINEMODE && is_sb && c.charCodeAt(n) > 31 && c.charCodeAt(n) < 127) {
      if (c.charCodeAt(n-1) < 32 || c.charCodeAt(n-1) > 126) out += ' "';
      out += c[n];
      if (n+1 < c.length && (c.charCodeAt(n+1) < 32 || c.charCodeAt(n+1) > 126)) out += '"';
    } else {
    switch (c[n]) {
      case t.IAC:       out += ' IAC'; break;
      case t.DO:        out += ' DO'; break;
      case t.DONT:      out += ' DONT'; break;
      case t.WILL:      out += ' WILL'; break;
      case t.WONT:      out += ' WONT'; break;
      case t.NEWENV:    out += ' NEW-ENVIRON'; break;
      case t.LINEMODE:  out += ' LINEMODE'; break;
      case '\x05':      out += ' STATUS'; break;
      case '\x06':      out += ' TM'; break;
      case '\x21':      out += ' LFLOW'; break;
      case '\x23':      out += ' XDISPLOC'; break;
      case '\x24':      out += ' ENVIRON'; break;
      case '\x25':      out += ' AUTH'; break;
      case '\x26':      out += ' ENC'; break;
      case '\x5d':      out += ' ZMP'; break;
      case t.GA:        out += ' GA'; break;
      case t.EOR:       out += ' EOR'; break;
      case t.EORc:      out += ' EORc'; break;
      case t.NAWS:      out += ' NAWS'; break;
      case t.TTYPE:     out += ' TTYPE'; break;
      case '\x56':      out += ' COMPRESSv2'; break;
      case t.MSSP:      out += ' MSSP'; break;
      case t.MSDP:      out += ' MSDP'; break;
      case t.MXP:       out += ' MXP'; break;
      case t.MSP:       out += ' MSP'; break;
      case '\x20':      out += ' TSPEED'; break;
      
      case t.SB:
        out += ' SB'; is_sb = true; sb_type = null;
        if(n + 1 < c.length && c[n+1] == t.MSSP)
        { sb_type = t.MSSP; out += ' MSSP'; n++; }
        else if(n + 1 < c.length && c[n+1] == t.MSDP)
        { sb_type = t.MSDP; out += ' MSDP'; n++; }
        else if(n + 1 < c.length && c[n+1] == t.LINEMODE)
        { sb_type = t.LINEMODE; out += ' LINEMODE'; n++; }
        else if(n + 1 < c.length && c[n+1] == t.NEWENV)
        { sb_type = t.NEWENV; out += ' NEW-ENVIRON'; n++; }
        break;
      
      case t.SE:        out += ' SE'; is_sb = false; break;
      
      case t.SUPGA:     out += is_sb && sb_type == t.NEWENV ? ' VAR' : ' SUPGA'; break;
      
      case t.IS:
        if (is_sb) {
          switch (sb_type) {
            case t.LINEMODE:  out += ' 0'; break;
            default:          out += ' IS'; break;
          }
        } else out += ' BINARY';
        break;
      
      case t.ECHO:
        if (is_sb) {
          switch (sb_type) {
            case t.LINEMODE:  out += ' MODE'; break;
            case t.MSDP:      out += ' MSDP_VAR'; break;
            case t.MSSP:      out += ' MSSP_VAR'; break;
            case t.NEWENV:    out += ' VAL'; break;
            default:          out += ' SEND';
          }
        } else out += ' ECHO';
        break;
      
      case t.MSSP_VAL:
        if (is_sb) {
          switch (sb_type) {
            case t.LINEMODE:  out += ' FORWARDMASK'; break;
            case t.MSDP:      out += ' MSDP_VAL'; break;
            default:          out += ' MSSP_VAL';
          }
        } else out += '02';
        break;

      default:
        out += ' ' + c.charCodeAt(n).toString(16).toUpperCase();
        break;
    } }
  }
  return out;
}

/**
 * Construct a jMUD object.
 * @param {array}  options  Array of options for jMUD.
 */
function jMUD(options) {
  // Basic Stuff
  this.hostname   = options.hostname;
  this.port       = options.port;
  this.options    = options;

  // Plugin Storage
  this.plugins    = [];

  // DOM Objects
  this.display    = null;
  this.socket     = null;
  this.input      = null;
  this.title      = null;
  this.alt_out    = {};
  this.active_out = '';
  this.alt_size   = {};
  this.def_out    = '';

  // Socket State
  this.connecting = false;
  this.connected  = false;
  this.ready      = false;
  
  // Buffers
  this.inbuf      = [];
  this.outbuf     = [];
  this.linesbuf   = [];
  this.needline   = { '' : false };
  
  // TELOPTs and Variables
  this.variables  = {};
  this.iac        = { 'ECHO' : true, 'EOR' : false, 'NAWS' : false, 'MSDP' : false, 'NEWENV' : false, 'TTYPE' : -1 },
  
  // Color and other ANSI States
  this.c_bright   = false;
  this.c_negative = false;
  this.c_italic   = false;
  this.c_blink    = false;
  this.c_under    = false;
  this.c_fg       = 7;
  this.c_bg       = 0;
  this.sbw        = null;
  this.orig_title = null;
  
  // Reconnection
  this.timer      = null;
  this.connectTry = 0;
  
  // Input Variables
  this.inputCtrl  = false;
  this.mruIndex   = 0;
  this.mruTemp    = false;
  this.mruHistory = [];
  this.mruSize    = options.cmdhistorysize;
	
	// IE7 and Under Flag
	this.ie7        = false;
  if ( jQuery.browser.msie && jQuery.browser.version.substr(0,1) < 8 )
    this.ie7 = true;
}

// The current version of jMUD
jMUD.prototype.version = '0.6.7';

/* A place to store all plugins. */
jMUD.prototype.available_plugins = {};

/******************************************************************************
 * Socket Interaction
 *****************************************************************************/

/* Reset the internal state variables. */
jMUD.prototype.resetState = function() {
  // Is echo off while we're managing input? Change it back to text then.
  if (this.iac.ECHO == false && this.input || this.input[0].tagName == 'TEXTAREA') {
    var cl = ''
    var st = ''
    if (this.input.attr('class'))
      cl = this.input.attr('class').replace(/"/g, '\\"');
    if (this.input.attr('style'))
      st = this.input.attr('style').replace(/"/g, '\\"');
    var id = this.input.attr('id');
    this.input.replaceWith('<input type="text" class="'+cl+'" style="'+st+'" id="'+id+'" />');
    
    // Attach a handler depending on the state of the command history option.
    if (this.options.cmdhistory) {
      this.input = jQuery('#'+id).keydown(this.handleInput).keyup(this.handleInputUp).data('jmud',this);
      this.input.attr('title','Type commands here, or use the Up and Down arrows to browse your recently used commands.');
    } else {
      this.input = jQuery('#'+id).keydown(this.handleSimple).keyup(this.handleInputUp).data('jmud',this);
      this.input.attr('title','Type commands here.');
    }
    this.input.blur(this.handleBlur).focus(this.handleBlur);
    this.inputCtrl = false;
  }

  this.variables  = {};
  this.iac        = { 'ECHO' : true, 'EOR' : false, 'NAWS' : false, 'MSDP' : false, 'NEWENV' : false, 'TTYPE' : -1 };
  this.inbuf      = [];
  this.outbuf     = [];
	this.splash			= null;
  
  this.c_bright   = false;
  this.c_italic   = false;
  this.c_negative = false;
  this.c_under    = false;
  this.c_blink    = false;
  this.c_fg       = 7;
  this.c_bg       = 0;
}

/* Create the socket. */
jMUD.prototype.setup = function() {
  // Create our socket.
  this.socket = new jSocket(this.onReady, this.onConnect, this.onData, this.onClose);
  this.socket.setup(this.options.id_socket, this.options.swflocation);
	
	// Start the timer.
	var j = this;
	this.timer = setTimeout(function() { j.noSocket(); }, 2500);
}

/* A function to display a message when we can't connect. */
jMUD.prototype.noSocket = function() {
	clearTimeout(this.timer);
	
	// Abort if we're already ready.
	if (this.ready)
		return;

	if (this.splash == null)
		this.splash = this.display.html();
  this.clear();
  this.mssg('jMUD v'+this.version+' by Stendec &lt;<a href="mailto:stendec365@gmail.com">stendec365@gmail.com</a>&gt;<br />');
  if (this.splash != '')
    this.mssg(this.splash + '<br />');

  // Show a warning for IE7- users.
  if (this.ie7)
    this.mssg('<b><span style="color:red">Warning:</span> jMUD does not function properly within Internet Explorer 7 and earlier due to a bad JavaScript implementation! Please use a different browser, such as <a href="http://www.getfirefox.com">Mozilla Firefox</a> or <a href="http://www.google.com/chrome">Google Chrome</a>, or update to Internet Explorer 8.</b><br />');

	this.mssg("<b>There seems to be an error creating the socket... make sure you're using jMUD from an http:// URL and not opening the file locally.</b>");
}

/* Connect the socket. */
jMUD.prototype.connect = function(silent) {
  // Delete our timer.
  clearTimeout(this.timer);

  // Ensure we're not already trying to connect.
  if (this.connecting || !this.ready)
    return;
  this.connecting = true;

  // If the policy port isn't standard, tell jsocket about it.
  if (this.options.policyport != 843)
    this.socket.loadpolicy(this.hostname, this.options.policyport);
  
  // Attempt to connect
  this.socket.connect(this.hostname, this.port);

  // Display a connecting message.
  if (silent !== true) {
    if (!this.hostname)
      this.mssg('<b>Connecting on port '+this.port+'...</b>');
    else this.mssg('<b>Connecting to '+this.hostname+':'+this.port+'...</b>');
  }
}

/* Disconnect the socket. */
jMUD.prototype.disconnect = function() {
  if (!this.connected) return;
  this.socket.close();
  this.connected = false;
  this.resetState();
  
  // Check the blur text.
  if (this.input && this.input.val() == this.options.emptymessage && this.input.hasClass(this.options.blurclass))
    this.input.val(this.options.connectmessage);
}

/*
 * Clear any text in the display and display the jMUD banner. Also attempt to
 * connect if necessary and run the user's onReady function.
 */
jMUD.prototype.onReady = function() {
  // Get jMUD
  var jmud = jQuery.fn.mud.sockets[this.id];
  
	// Stop the timer
	clearTimeout(this.timer);
	
  // Set the ready flag and output our header.
  jmud.ready = true;
  if (jmud.splash == null)
		jmud.splash = jmud.display.html();
  jmud.clear();
  jmud.mssg('jMUD v'+jmud.version+' by Stendec &lt;<a href="mailto:stendec365@gmail.com">stendec365@gmail.com</a>&gt;<br />');
  if (jmud.splash != '')
    jmud.display.append(jmud.splash + '<br />');

  // Show a warning for IE7 users.
  if (jmud.ie7)
    jmud.mssg('<b><span style="color:red">Warning:</span> jMUD does not function properly within Internet Explorer 7 and earlier due to a bad JavaScript implementation! Please use a different browser, such as <a href="http://www.getfirefox.com">Mozilla Firefox</a> or <a href="http://www.google.com/chrome">Google Chrome</a>, or update to Internet Explorer 8.</b><br />');
  
  // If autostart is on, attempt to connect.
  if (jmud.options.autostart)
    jmud.connect();
  
  // Raise an event
  var e = jQuery.Event('onReady');
  e.jmud = jmud;
  jmud.display.trigger(e);
}

/* Handle jSocket's onConnect event. */
jMUD.prototype.onConnect = function(success, data) {
  // Get jMUD
  var jmud = jQuery.fn.mud.sockets[this.id];
  
  // First, disable the connecting flag.
  jmud.connecting = false;
  
  // Were we able to connect successfully?
  if (success) {
    jmud.connected = true;
    jmud.mssg('<b>Connected.</b>');
    
    // Reset the connection try variable.
    jmud.connectTry = 0;
    
    // Check the blur text.
    if (jmud.input && jmud.input.val() == jmud.options.connectmessage && jmud.input.hasClass(jmud.options.blurclass))
      jmud.input.val(jmud.options.emptymessage);
    
    // Raise an event
    var e = jQuery.Event('onConnected');
    e.jmud = jmud;
    jmud.display.trigger(e);
  
  } else {
    jmud.connected = false;
    
    switch (data) {
      case 'Error #2048' : data = ' due to a Flash security error'; break;
      default: data = '';
    }
    
    // Should we retry?
    if ( jmud.options.autoreconnect && jmud.connectTry < jmud.options.reconnecttries) {
      jmud.connectTry++;
      jmud.mssg('<b>Unable to connect'+data+'. Retrying ('+jmud.connectTry+' of ' + jmud.options.reconnecttries+')...');
      jmud.timer = setTimeout( function() { jmud.connect(true); }, jmud.options.reconnectdelay );
    } else {
      jmud.mssg('<b>Unable to connect'+data+'.</b>');
      jmud.connectTry = 0;
      clearTimeout(jmud.timer);
      jmud.socket.close();
    }
  }
}

/* Handle jSocket's onClose event. */
jMUD.prototype.onClose = function() {
  // Get jMUD
  var jmud = jQuery.fn.mud.sockets[this.id];

  // Reset the internal state.
  jmud.connected = false;
  jmud.resetState();
  
  // Check the blur text.
  if (jmud.input && jmud.input.val() == jmud.options.emptymessage && jmud.input.hasClass(jmud.options.blurclass))
    jmud.input.val(jmud.options.connectmessage);
  
  // Raise an event
  var e = jQuery.Event("onDisconnected");
  e.jmud = jmud;
  jmud.display.trigger(e);
  
  // If we're managing input and the last line looks like a quit command, don't reconnect.
  if (jmud.input && (jmud.input.val().toLowerCase() == 'q' || jmud.input.val().toLowerCase() == 'qui' || jmud.input.val().toLowerCase() == 'quit'))
    e.preventDefault();
  
  // If we can reconnect and that trigger wasn't interrupted, reconnect.
  if (!e.isDefaultPrevented() && jmud.options.autoreconnect) {
    // Display that we're trying to reconnect.
    jmud.mssg('<b>Connection closed. Attempting to reconnect...</b>');
    jmud.timer = setTimeout( function() { jmud.connect(true); }, jmud.options.reconnectdelay );
  } else {
    // Display a disconnected message.
    jmud.mssg('<b>Connection closed.</b>');
  }
}

/* Recieve fresh data and process it. */
jMUD.prototype.onData = function(data) {
  // Get jMUD
  var jmud = jQuery.fn.mud.sockets[this.id];
  
  // Add this data to our input buffer.
  jmud.inbuf.push(data);
  
  // Process the buffer.
  jmud.processData();
}

/******************************************************************************
 * Data Processing
 *****************************************************************************/

/* Process our input buffer. And praise the awesomeness of regular expressions
   while you're at it. */
jMUD.prototype.processData = function() {
  // Do we have data? If not, quit.
  if (this.inbuf.length < 1)
    return;
  
  // Build a string of our data.
  data = this.inbuf.join('');
  this.inbuf = [];
  
  // Raise an event for pre-processing the text.
  var e = jQuery.Event("processRecieved");
  e.jmud = this;
  e.text = data;
  this.display.trigger(e);
  
  // If we have a result, store that over the data.
  if (e.result !== undefined)
    e.text = e.result;
  data = e.text;
  
  // Reset the index of the regex.
  this.preg.lastIndex = 0;
  
  // Use regex to chunk through the data, removing any IAC sequences and ANSI
  // escape codes.
  var m = this.preg.exec(data);
  while(m != null && m[0].length > 0) {
    // Is there normal text to display?
    if (m[1].length > 0) {
      // Create and raise an event for processing text.
      var e = jQuery.Event("processOutput");
      e.jmud = this;
      e.text = m[1];
      this.display.trigger(e);
      
      // If we've got a result, store that over text. If not isDefaultPrevented
      // then clean away HTML characters.
      if (e.result !== undefined)
        e.text = e.result;
      if (!e.isDefaultPrevented())
        e.text = e.text.htmlspecialchars();
      
      // Send out the text to be displayed.
      this.out(e.text);
    }
    
    // Is there an IAC sequence or ANSI escape code?
    if (m[2].length > 0) {
      if (m[2][0] == '\n')
      { // Linebreak. Do a push.
        this.linepush(true);
      }
      else if (m[2][0] == this.telopt.IAC)
      { this.handleIAC(m[2]); }
      else if (m[2][0] == this.telopt.ESC)
      { this.handleANSI(m[2]); }
    }
    
    // Run the regex again to continue.
    m = this.preg.exec(data);
  }

  // Is there anything left? If so, push it to the front of inbuf. It's an ANSI
  // code or IAC sequence split across packets. Be careful that it isn't just
  // corrupt though. If this gets too large, remove the stopping character.
  if(data.length > this.preg.lastIndex)
  { if (data.length - this.preg.lastIndex > 500)
      this.inbuf.push(data.substr(this.preg.lastIndex+1));
    else
      this.inbuf.push(data.substr(this.preg.lastIndex));
  }

  // Push the output buffer to the display.
  this.linepush();
  this.push();
}

/* Send NAWS data to the client */
jMUD.prototype.doNAWS = function() {
  if (this.options.debugtelnet)
    this.mssg(this.debugIAC(this.telopt.IAC + this.telopt.SB + this.telopt.NAWS, 'SENT'));
  var sz = this.getSize();
  this.socket.naws(sz.cols, sz.rows);
}

/* Process an IAC Sequence */
jMUD.prototype.handleIAC = function(data) {
  // Based on the type of sequence, act.
  // First, just quit if it's an EOR.
  var t = this.telopt;
  if(data == t.IAC + t.EORc || data == t.IAC + t.GA)
    return;
  
  if (this.options.debugtelnet)
    this.mssg(this.debugIAC(data));
  
  switch (data[1]) {
    case t.DO:
    case t.DONT:
    case t.WILL:
    case t.WONT:
      // Telnet Switch
      var s = data.substr(1);
      if (s == t.WILL + t.ECHO) {
        this.iac.ECHO = false;
        this.sendIAC(t.IAC + t.DO + t.ECHO);
        // Are we controlling the input box? If so, convert it to a password entry.
        if (this.input) {
          var cl = ''
          var st = ''
          if (this.input.attr('class'))
            cl = this.input.attr('class').replace(/"/g, '\\"');
          if (this.input.attr('style'))
            st = this.input.attr('style').replace(/"/g, '\\"');
          var id = this.input.attr('id');
          this.input.replaceWith('<input type="password" class="'+cl+'" style="'+st+'" id="'+id+'" />');
          this.input = jQuery('#'+id).keydown(this.handleSimple).keyup(this.handleInputUp).data('jmud',this);
          this.input.attr('title','Type your password here.');
          setTimeout( function() { jQuery('#'+id).focus(); }, 1 );
        }
        
        // Raise an event.
        var e = jQuery.Event("onIACECHO");
        e.jmud = this;
        e.echo = false;
        this.display.trigger(e);
      }
      else if (s == t.WONT + t.ECHO)
      { // The server is no longer echoing. Re-enable local echo and change
        // the input box back to normal.
        this.iac.ECHO = true;
        this.sendIAC(t.IAC + t.DONT + t.ECHO);
        // Are we controlling the input box? If so, convert it back to text.
        if (this.input) {
          var cl = ''
          var st = ''
          if (this.input.attr('class'))
            cl = this.input.attr('class').replace(/"/g, '\\"');
          if (this.input.attr('style'))
            st = this.input.attr('style').replace(/"/g, '\\"');
          var id = this.input.attr('id');
          this.input.replaceWith('<input type="text" class="'+cl+'" style="'+st+'" id="'+id+'" />');
          if (this.options.cmdhistory) {
            this.input = jQuery('#'+id).keydown(this.handleInput).keyup(this.handleInputUp).data('jmud',this);
            this.input.attr('title','Type commands here, or use the Up and Down arrows to browse your recently used commands.');
          } else {
            this.input = jQuery('#'+id).keydown(this.handleSimple).keyup(this.handleInputUp).data('jmud',this);
            this.input.attr('title','Type commands here.');
          }
          this.input.blur(this.handleBlur).focus(this.handleBlur);
          setTimeout( function() { jQuery('#'+id).focus(); }, 1 );
        }
        
        // Raise an event.
        var e = jQuery.Event("onIACECHO");
        e.jmud = this;
        e.echo = true;
        this.display.trigger(e);
      }
      
      else if (s == t.WILL + t.EOR)
      { // The server is offering to send EOR notices at the end of messages.
        // Do it.
        this.iac.EOR = true;
        this.sendIAC(t.IAC + t.DO + t.EOR);
      }
      
      else if (s == t.DO + t.TTYPE)
      { // The server's requesting TTYPE. Report that we support it.
        this.sendIAC(t.IAC + t.WILL + t.TTYPE); }
      
      else if (s == t.DO + t.NAWS)
      { // The server is requesting NAWS. Send it to the server.
        this.iac.NAWS = true;
        this.sendIAC(t.IAC + t.WILL + t.NAWS);
        this.doNAWS();
      }
      
      else if (s == t.WILL + t.SUPGA)
      { // The server is offering to supress GA. Do it.
        this.sendIAC(t.IAC + t.DO + t.SUPGA);
      }
      
      else if (s == t.DO + t.LINEMODE)
      { // The server is requesting LINEMODE negotiation. Do it.
        this.sendIAC(t.IAC + t.SB + t.LINEMODE + t.ECHO + t.IS + t.IAC + t.SE);
        this.sendIAC(t.IAC + t.SB + t.LINEMODE + t.WONT + t.MSSP_VAL + t.IAC + t.SE);
      }
      
      else if (s == t.DO + t.NEWENV)
      { // The server is requesting NEW-ENVIRON. We can do that.
        this.sendIAC(t.IAC + t.WILL + t.NEWENV); }
      
      else if (s == t.WILL + t.MSDP)
      { // The server is offering MSDP. Report that we support it.
        this.sendIAC(t.IAC + t.DO + t.MSDP); }
      
      else if (s == t.WILL + t.MSSP)
      { // The server is offering MSSP. Ask for it if we're debugging telnet
        // to prove it works.
        if (this.options.debugtelnet)
          this.sendIAC(t.IAC + t.DO + t.MSSP);
        else
          this.sendIAC(t.IAC + t.DONT + t.MSSP);
      }
      
      else {
        // Raise an event for this IAC switch.
        var e = jQuery.Event("onIACSwitch");
        e.jmud    = this;
        e.raw     = data;
        e.action  = data[1];
        e.option  = data[2];
        this.display.trigger(e);
        
        // If not isDefaultPrevented, automatically return a negative response.
        if (!e.isDefaultPrevented()) {
          if (data[1] == t.WILL && data.length > 2)
            this.sendIAC(t.IAC + t.DONT + data[2]);
          else if (data[1] == t.DO && data.length > 2)
            this.sendIAC(t.IAC + t.WONT + data[2]);
        }
      }
      
      break;
    
    case t.SB:
      // Subnegotiation
      if (data == t.IAC + t.SB + t.TTYPE + t.ECHO + t.IAC + t.SE)
      { // TTYPE Request. Send a TTYPE.
        this.iac.TTYPE++;
        if (this.iac.TTYPE >= this.options.ttypes.length) this.iac.TTYPE = 0;
        this.sendIAC(t.IAC + t.SB + t.TTYPE + t.IS + this.options.ttypes[this.iac.TTYPE] + t.IAC + t.SE);
      }
      
      else if (data[2] == t.NEWENV)
      { // NEW-ENVIRON Request. Handle it.
        this.handleNEWENV(data.substr(3, data.length - 5));
      }
      
      else if (data[2] == t.MSDP)
      { // MSDP Data. Handle it
        this.handleMSDP(data.substr(3,data.length - 5));
      }
      
      else {
        // Raise an event
        var e = jQuery.Event("onIACSubneg");
        e.jmud    = this;
        e.raw     = data;
        e.option  = data[2];
        e.text    = data.substr(3, data.length - 5);
        this.display.trigger(e);
      }
      
      break;
    
    default:
      // Unrecognized. Echo it.
      this.out(data.substr(1));
  }
}

/* Handle NEW-ENVIRON subnegotiation. This both sends our own variables and
   accepts them from a server. */
jMUD.prototype.handleNEWENV = function(data) {
  // Are we sending? If we're sending, call the subfunction for that.
  if (data[0] == ECHO) {
    this.sendNEWENV(data.substr(1));
    return;
  }
  
  // If we're not recieving data either, exit. It's a bad string.
  if (data[0] != this.telopt.ECHO && data[0] != this.telopt.MSSP_VAL)
    return;
  
  data = data.substr(1);
  this.neweni_reg.lastIndex = 0;
  var m = this.neweni_reg.exec(data);
  while (m != null && m[0] != '') {
    // Is the variable new or updated?
    if (m[3] !== this.variables[m[2]]) {
      // It is. Store it and raise an event.
      this.variables[m[2]] = m[3];
      
      var e = jQuery.Event("onVarChange");
      e.jmud  = this;
      e.key   = m[2];
      e.value = m[3];
      this.display.trigger(e);
    }
    
    m = this.neweni_reg.exec(data);
  }
}

/* Send NEW-ENVIRON variables to the server. */
jMUD.prototype.sendNEWENV = function(data) {
  // If we have a list of keys from the server, only send those.
  var keys = [];
  var stds = ['USER','JOB','ACCT','PRINTER','SYSTEMTYPE','DISPLAY'];
  
  if (data == '')
  { // No request. Add all available keys.
    for(var k in this.options.environ)
      keys.push(k);
  } else
  { // Read through and add all possible keys.
    this.newenv_reg.lastIndex = 0;
    var m = this.newenv_reg.exec(data);
    while (m != null && m[0] != '') {
      if (m[2] != '')
        keys.push(m[2]);
      else {
        if (m[1] == IS)
          keys = keys.concat(stds);
        else {
          for(var k in this.options.environ) {
            if (!(k in stds))
              keys.push(k);
          }
        }
      }
    }
  }
  
  // Now that we have a list of keys, build our output and send it.
  var out = this.telopt.IAC + this.telopt.SB + this.telopt.NEWENV + this.telopt.IS;
  for(n=0; n < keys.length; n++) {
    var v = this.options.environ[keys[n]];
    if (v != null) {
      if (keys[n] in stds) out += this.telopt.IS;
      else out += this.telopt.SUPGA;
      out += keys[n].replace(/\x02/g,'\x02\x02') + this.telopt.ECHO + this.options.environ[keys[n]].replace(/\x02/g,'\x02\x02');
    }
  }
  
  this.sendIAC(out + this.telopt.IAC + this.telopt.SE);
}

/* Handle MSDP Data, storing it into variables and raising events if any values
   are changed. */
jMUD.prototype.handleMSDP = function(data) {
  this.msdp_reg.lastIndex = 0;
  var m = this.msdp_reg.exec(data);
  while (m != null && m[0] != '') {
    var v = m[2].substr(1);
    var changed = false;
    
    // Is it a list?
    if (v.indexOf('\x02') > -1)
      v = m[2].substr(1).split(/\x02/);

    // Set the variable.
    this.setVariable(m[1], v);
    
    m = this.msdp_reg.exec(data);
  }
}

/* Set a variable, calling any necessary events. */
jMUD.prototype.setVariable = function(key, value) {
  var changed = false;
  if (typeof value == 'object') changed = !value.compare(this.variables[key]);
  else changed = value !== this.variables[key];
  
  // If it's changed, raise an event after storing it.
  if (changed) {
    this.variables[key] = value;
    
    var e = jQuery.Event("onVarChange");
    e.jmud = this;
    e.key = key;
    e.value = value;
    this.display.trigger(e);
  }
}

/* Process an ANSI Escape Sequence */
jMUD.prototype.handleANSI = function(data) {
  var ESC = this.telopt.ESC;
  
  if (data == ESC + 'c')
  { // XTERM Full Reset
    this.c_bright = false; this.c_fg = 7; this.c_bg = 0;
    this.clear();
    return;
  }
  
  else if (data.substr(1,3) == ']2;' || data.substr(1,3) == ']0;')
  { // XTERM Title String
    var t = data.substr(4, data.length - 5)
    if (t[t.length-1] == ESC) t = t.substr(0,t.length-1);
    this.setTitle(t);
    return;
  }
  
  else if (data[1] == '[')
  { // ANSI. Depending on the last character, act.
    switch(data[data.length-1]) {
      case 'J':
        // Clear Screen
        this.clear();
        break;
      case 'm':
        // Color
        if (this.options.handlecolor) {
          var o_fg = this.c_fg;
          var o_bg = this.c_bg;
          var o_br = this.c_bright;
          var o_it = this.c_italic;
          var o_un = this.c_under;
          var o_ne = this.c_negative;
          var o_bl = this.c_blink;
          if (data.substr(1,6) == '[38;5;')
          { // XTERM Forecolor
            this.c_fg = parseInt(data.substr(7, data.length - 8));
          } else if (data.substr(1,6) == '[48;5;')
          { // XTERM Backcolor
            this.c_bg = parseInt(data.substr(7, data.length - 8));
          } else if (data.length == 3)
          { // ANSI Color Reset
            this.c_bright = false; this.c_fg = 7; this.c_bg = 0;
          } else {
            // ANSI Color
            var cs = data.substr(2, data.length-3).split(';')
            for(n=0; n < cs.length; n++)
            {
              c = parseInt(cs[n]);
              if      (c == 0) {
                this.c_bright = false; this.c_negative = false; this.c_italic = false; this.c_under = false; this.c_blink = false;
                this.c_fg = 7; this.c_bg = 0; }
              else if (c == 1) { this.c_bright = true; }
              else if (c == 3) { this.c_italic = true; }
              else if (c == 4) { this.c_under = true; }
              else if (c == 5 || c == 6) { this.c_blink = true; }
              else if (c == 7) { this.c_negative = true; }
              else if (c == 22) { this.c_bright = false; }
              else if (c == 24) { this.c_under = false; }
              else if (c == 25) { this.c_blink = false; }
              else if (c == 27) { this.c_negative = false; }
              else if (c >= 30 && c < 40) { this.c_fg = c - 30; }
              else if (c >= 40 && c < 50) { this.c_bg = c - 40; }
              else if (c >= 90 && c < 100) { this.c_fg = c - 90; this.c_bright = true; }
              else if (c >= 100 && c < 110) { this.c_bg = c - 100; this.c_bright = true; }
            }
          }
          
          // Do we need a fresh color tag?
          if (o_fg != this.c_fg || o_bg != this.c_bg || o_br != this.c_bright || o_it != this.c_italic ||
              o_un != this.c_under || o_ne != this.c_negative || o_bl != this.c_blink)
            this.outColor();
        }
        return;
        break;
    }
  }
  
  // Still here? Unrecognized. Raise an event.
  var e = jQuery.Event('onANSI');
  e.jmud = this;
  e.raw  = data;
  this.display.trigger(e);
}

/******************************************************************************
 * User Interface and Input
 *****************************************************************************/

/* Send an IAC Sequence. If there are any NULL characters, take special care to
   send those as well. */
jMUD.prototype.sendIAC = function(data) {
  if (!this.connected && this.options.connectonsend)
  { this.connect(); return; }
  if (this.options.debugtelnet)
    this.mssg(this.debugIAC(data, 'SENT'));
  
  this.socket.write(data);
}

/* Process Input */
jMUD.prototype.send = function(text, skipEvent, quiet) {
  if (skipEvent !== true) {
    // Run an event.
    var e = jQuery.Event("onSendCommand");
    e.jmud = this;
    e.text = text;
    this.display.trigger(e);
  
    // Is the default action prevented? Exit then.
    if (e.isDefaultPrevented())
      return;
  
    // Is there a result? Store it into text.
    if (e.result !== undefined)
      e.text = e.result;
    text = e.text;
  }

  if (!this.connected && this.options.connectonsend)
  { this.connect(); return; }
  
  if (this.iac.ECHO && quiet !== true)
    this.mssg('<span class="'+this.options.fgclass+this.options.inputfg+' '+this.options.bgclass+this.options.inputbg+'">' + text.replace(/\n/g,'<br />') + '</span>',undefined,false);
  this.socket.write(text + '\r\n');
}

/* Switch to using a different output element. If lock is true,
   make it the default until changed. Otherwise jMUD will switch
   back to the default element after the next line. */
jMUD.prototype.useOutput = function(key, lock) {
  if (this.alt_out[key] === undefined && key != '')
    return;

  // Save it.
  this.active_out = key;
  
  // Should it be default?
  if (lock === true)
    this.def_out = key;
}

/* Create a new output element. If use is true, start using it
   right away. If lock is true, make this the new default output
   element. */
jMUD.prototype.setOutput = function(key, element, use, lock) {
  // If there's no key, abort
  if (typeof key != 'string' || key == '') return false;
  
  // If we have an element, we're creating. If it's null or undefined, we're deleting.
  if (element != null && element !== undefined) {
    // Create an output element. First, make sure we store a jQuery object.
    if (!element.jQuery)
      element = jQuery(element);
    
    // Store the output element and attach a class
    this.alt_out[key] = element;
    element.addClass('jmud-display');
    element.data('jmud', this);
    
    // If lock is true, make this the default output element.
    if (lock === true) {
      this.def_out = key;
      use = true;
    }
    
    // If use is true, switch to using it immediately
    if (use === true)
      this.active_out = key;
  } else {
    // Just delete that output entry and make sure we're not using it.
    if (this.active_out == key)
      this.active_out = '';
    if (this.def_out == key)
      this.def_out = '';
    
    // Remove the display class from the element.
    this.alt_out[key].removeClass('jmud-display');
    this.alt_out[key].data('jmud', undefined);
    this.alt_out[key] = undefined;
  }
  
  return true;
}

/* Calculate columns and rows of the screen. If a key is specified, calculate
   size of that specific output element. */
jMUD.prototype.getSize = function(key) {
  // Do we already know the scrollbar width?
  if (!this.sbw)
    this.sbw = this.scrollbarWidth();
  if (this.sbw == 0)
    this.sbw = 15;
  
  // If key is undefined, use the active output key.
  if (key === undefined)
    key = this.active_out;
  
  // Get our element. If key is null, use the main display.
  if (key == '')
    var element = this.display;
  else
    var element = this.alt_out[key];
  
  // Get the height and width of the display element.
  var tw = element.innerWidth() - this.sbw;
  var th = element.innerHeight();
  
  var s = jQuery(document.createElement('span')).text('A');
  element.append(s);
  var w = s.width();
  var h = s.height();
  s.remove();
  
  return { 'cols' : Math.floor(tw / w), 'rows' : Math.floor(th / h) }
}

/* Clear the display. If a key is specified, clear that specific output
   element. */
jMUD.prototype.clear = function(key) {
  // If key is undefined, use the active output key.
  if (key === undefined)
    key = this.active_out;
  
  // Get our element. If key is null, use the main display.
  if (key == '')
    var element = this.display;
  else
    var element = this.alt_out[key];
  
  if (this.options.handleclear)
    element.empty();
  else
    this.mssg('', key);
}

/* Set the Window Title */
jMUD.prototype.setTitle = function(text) {
  // If we have a title element, output our text there.
  if (this.title) {
    if (text == '') this.title.text('jMUD v' + this.version);
    else this.title.text(text);
  }
  
  if (this.options.windowtitle) {
    if (!this.orig_title)
      this.orig_title = document.title;
    if (this.orig_title == '') {
      if (text == '') document.title = 'jMUD v' + this.version;
      else document.title = text;
    } else {
      if (text == '') document.title = this.orig_title;
      else document.title = text + ' - ' + this.orig_title;
    }
  }
  
}

/* Send a message to the display. If we have a key, use that instead
   of the default. */
jMUD.prototype.mssg = function(text, key, addline) {
  // If key is undefined, use the active output key.
  if (key === undefined)
    key = this.active_out;
  
  // Get our element. If key is null, use the main display.
  if (key == '')
    var element = this.display;
  else
    var element = this.alt_out[key];

  if (this.needline[key] && addline !== false) text = '<br />' + text;
  this.needline[key] = false;
  var s = document.createElement('span');
  element.append(s);
  s.innerHTML = text + '<br />';
  this.doScroll(key);
}

/* Colorization Tag */
jMUD.prototype.outColor = function(closing,ret) {
  if (closing !== false) closing = true;
  if (ret !== true) ret = false;
  
  var f = this.c_fg;
  var b = this.c_bg;
  if (this.c_bright && f < 8) f += 8;
  
  if (closing) var out = '</span><span class="';
  else var out = '<span class="';
  
  if (this.c_italic) out += 'italic ';
  if (this.c_blink) out += 'blink ';
  if (this.c_under) out += 'underline ';
  if (this.c_negative) {
    var t = f;
    f = b;
    b = t;
  }
  
  if (f != 7)
    out += this.options.fgclass+f+' ';
  if (b != 0)
    out += this.options.bgclass+b;
  out += '">';
  
  if (ret)
    return out;
  else
    this.outbuf.push(out);
}

/* Buffer output. */
jMUD.prototype.out = function(text) {
  this.outbuf.push(text);
}

/* Add a line to the buffer of lines to output. */
jMUD.prototype.linepush = function(appendBR) {
  // Build our text.
  var text = this.outbuf.join('');
  this.outbuf = [];
  
  // Send it through an event if it isn't empty.
  if ( text != '' && this.options.linecapture) {
    var e = jQuery.Event('onText');
    e.jmud = this;
    e.text = text.undohtml();
    e.html = text;
    this.display.trigger(e);
    
    // If default is prevented, return
    if (e.isDefaultPrevented())
      return;
  }
  
  // Add this to the line buffer
  if (appendBR == true)
    this.linesbuf.push(text + '<br />')
  else
    this.linesbuf.push(text);

  // If active_out isn't def_out then we need to switch back to our default
  // output element. Force an immediate push.
  if (this.active_out != this.def_out)
    this.push();
}

/* Send the output buffer to the display. If key is specified, send it to
   that element instead of the active one. */
jMUD.prototype.push = function(doScroll, key) {
  // If key is undefined, use the active output key.
  if (key === undefined)
    key = this.active_out;
  
  // Get our element. If key is null, use the main display.
  if (key == false)
    var element = this.display;
  else
    var element = this.alt_out[key];
  
  // Build our text
  var text = this.linesbuf.join('');
  this.linesbuf = [];
  
  var s = document.createElement('span');
  element.append(s);
  s.innerHTML = text;
  
  // Only set needline to true for the default display where output goes.
  if ((text.endsWith('<br />') || text.endsWith('<br>')) && this.active_out == this.def_out)
    this.needline[key] = false;
  else this.needline[key] = true;
  
  // Raise an event for plugins to attach any custom events to elements
  var e = jQuery.Event('onFinalText');
  e.jmud = this;
  e.element = s;
  this.display.trigger(e);
  
  // Scroll if necessary.
  if (doScroll !== false)
    this.doScroll();

  // Finally, change the output element back to the default
  if (this.active_out != this.def_out)
    this.active_out = this.def_out;
}

/* Scroll the output buffer to the bottom. */
jMUD.prototype.doScroll = function(key) {
  // If key is undefined, use the active output key.
  if (key === undefined)
    key = this.active_out;
  
  // Get our element. If key is null, use the main display.
  if (key == false)
    var element = this.display;
  else
    var element = this.alt_out[key];
    
  element.attr({ scrollTop: element.attr("scrollHeight") });
}

/* Handle Input Blur / Focus */
jMUD.prototype.handleBlur = function(e) {
  var jmud = jQuery(this).data('jmud');
  
  if (e.type == 'blur' && this.value == '') {
    // Blur. Store the appropriate message.
    jmud.input.addClass(jmud.options.blurclass);
    if (jmud.connected)
      this.value = jmud.options.emptymessage;
    else
      this.value = jmud.options.connectmessage;

  } else if (e.type == 'focus') {
    // Focus. If one of the messages is stored, clear it.
    jmud.input.removeClass(jmud.options.blurclass);
    if (this.value == jmud.options.emptymessage || this.value == jmud.options.connectmessage)
      this.value = '';
  }
}

/* Handle Input */
jMUD.prototype.handleSimple = function(e) {
  var jmud = jQuery(this).data('jmud');
  if (e.keyCode == 13) {
    // Enter
    jmud.send(this.value);
    if (jmud.options.clearonsend)
      this.value = '';
    else
      this.select();
  }
}

/* Handle Input with MRU */
jMUD.prototype.handleInputUp = function(e) {
  var jmud = jQuery(this).data('jmud');
  if (e.keyCode == 17)
    // Ctrl Key
    jmud.inputCtrl = false;
  else if (this.tagName == 'TEXTAREA') {
    // Check the number of lines
    var lines = jmud.input.val().substr_count('\n') + 1;
    if (lines != jmud.input.data('lines')) {
      setTimeout(function() {
        var c = jmud.input.caret();
        jmud.inputLines(lines);
        jmud.input.caret(c.begin,c.end);
      },1);
    }
  }
}

jMUD.prototype.inputLines = function(lines) {
  // Change the number of lines of the input box to the specified value
  if (lines == 1 && this.input[0].tagName == 'TEXTAREA') {
    // <textarea> to <input>
    var cl = ''; var st = ''; var txt = this.input.val();
    if (this.input.attr('class')) cl = this.input.attr('class').replace(/"/g, '\\"');
    if (this.input.attr('style')) st = this.input.attr('style').replace(/"/g, '\\"');
    var id = this.input.attr('id');
    this.input.replaceWith('<input class="'+cl+'" style="'+st+'" id="'+id+'" />');
    this.input = jQuery("#"+id).keydown(this.handleInput).keyup(this.handleInputUp).blur(this.handleBlur).focus(this.handleBlur).data('jmud',this);
    this.input.val(txt);
    setTimeout(function() { jQuery("#"+id).focus(); }, 1);
  } else if (lines > 1 && this.input[0].tagName == 'INPUT') {
    // <input> to <textarea>
    var cl = ''; var st = ''; var txt = this.input.val();
    if (this.input.attr('class')) cl = this.input.attr('class').replace(/"/g, '\\"');
    if (this.input.attr('style')) st = this.input.attr('style').replace(/"/g, '\\"');
    var id = this.input.attr('id');
    this.input.replaceWith('<textarea class="'+cl+'" style="'+st+'" id="'+id+'"></textarea>');
    this.input = jQuery("#"+id).keydown(this.handleInput).keyup(this.handleInputUp).data('jmud',this);
    if (jQuery.browser.mozilla)
      this.input.attr('rows',lines-1);
    else
      this.input.attr('rows',lines)
    this.input.val(txt);
    setTimeout(function() { jQuery("#"+id).focus(); }, 1);
  } else if (lines > 1) {
    // <textarea> Size Change
    if (jQuery.browser.mozilla)
      this.input.attr('rows',lines-1);
    else
      this.input.attr('rows',lines)
  }
  this.input.data('lines', lines);
}

jMUD.prototype.handleInput = function(e) {
  var jmud = jQuery(this).data('jmud');
  if (this.type == 'password') {
    if (e.keyCode == 17)
      // Ctrl Key
      jmud.inputCtrl = true;
    else if (e.keyCode == 13) {
      jmud.send(this.value);
      if(jmud.options.clearonsend)
        this.value = '';
      else
        this.select();
    }
  } else {
    if (e.keyCode == 17)
      // Ctrl Key
      jmud.inputCtrl = true;
    
    else if (e.keyCode == 13) {
      // Enter. Split based on the state of Ctrl
      if (jmud.inputCtrl && jmud.options.multiline) {
        // Add a line to the text input. If we're just using a normal input
        // element then change it into a <textarea>.
        var c = jmud.input.caret();
        var txt = this.value.substr(0, c.begin) + '\n' + this.value.substr(c.end);
        var lines = txt.substr_count('\n');
        
        if (this.tagName == 'INPUT') {
          // Replace with a text area
          jmud.inputLines(lines+1);
          jmud.input.val(txt);
        } else {
          // Just set the value
          jmud.input.val(txt);
          jmud.input.attr('rows', lines);
        }
        jmud.input.caret(c.begin+1, c.begin+1);
        return false;
      } else {
        jmud.send(this.value);
        
        // Return before handling MRU stuff if this is a textarea
        if (this.tagName == 'TEXTAREA') {
          if (jmud.options.clearonsend) {
            this.value = '';
            jmud.inputLines(1);
          } else
            this.select();
          return false;
        }
        
        // Is there a temporary item? Remove it.
        if (jmud.mruTemp) {
          jmud.mruHistory.splice(jmud.mruHistory.length - 1, 1);
          jmud.mruTemp = false;
        }
        
        // Add the item to our MRU.
        jmud.mruIndex = jmud.mruHistory.push(this.value) - 1;
        
        // Make sure the MRU isn't too long.
        if (jmud.mruHistory.length > jmud.mruSize)
          jmud.mruHistory.shift();
        
        // Select or clear the text.
        if (jmud.options.clearonsend)
          this.value = '';
        else
          this.select();
        
        return false;
      }
    }
    
    // Only handle up and down for the single-line editor.
    else if ((e.keyCode == 38 || e.keyCode == 40) && this.tagName == 'INPUT') {
      // Key Up or Key Down
      // First off, store our current text in the MRU list if
      // it's not already there.
      if (jmud.mruHistory.contains(this.value) === false) {
        jmud.mruTemp = true;
        jmud.mruIndex = jmud.mruHistory.push(this.value) - 1;
      }
      
      // Move up or down through the list
      if (e.keyCode == 38) {
        // Up
        jmud.mruIndex--;
        if (jmud.mruIndex < 0) jmud.mruIndex = jmud.mruHistory.length - 1;
      } else {
        // Down
        jmud.mruIndex++;
        if (jmud.mruIndex >= jmud.mruHistory.length) jmud.mruIndex = 0;
      }
      
      // Recall the item. If it's the same as our current text, remove it from
      // the array.
      var v = jmud.mruHistory[jmud.mruIndex];
      if (v == this.value) {
        jmud.mruTemp = false;
        jmud.mruHistory.splice(jmud.mruIndex,1);
        jmud.mruIndex = 0;
      } else {
        this.value = v;
        var id = this.id;
        setTimeout( function() { jQuery('#'+id).select(); }, 1);
      }
      
      return false;
    }
  }
}

/* Calculate the width of the browser's scrollbar. */
jMUD.prototype.scrollbarWidth = function() {
    var div = jQuery('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
    // Append our div, do our calculation and then remove it
    jQuery('body').append(div);
    var w1 = jQuery('div', div).innerWidth();
    div.css('overflow-y', 'scroll');
    var w2 = jQuery('div', div).innerWidth();
    jQuery(div).remove();
    return (w1 - w2);
}

/**
 *
 * jQuery Interaction Stuff
 *
 **/

/* Bind an event to jMUD's host element. */
jMUD.prototype.bind = function(type, data, fn) {
  if (fn === undefined)
    this.display.bind(type, data);
  else
    this.display.bind(type, data, fn);
}

;(function($){
  /*
  * Turn a DOMnode into a MUD client.
  *
  ***************************************************************************
  * Options
  ***************************************************************************
  * Options allow you to customize basic behaviors of jMUD. To use an option,
  * specify it while you're creating the jMUD object like you would an array
  * of options for any other jQuery plugin. See an example for more info.
  *
  * hostname        String. The remote host to connect to.
  * port            Integer. The port to access on the remote host.
  * policyport      Integer. The port to retrieve the flash policy file from,
  *                 if one is not available at port 843.
  *
  * swflocation     String. Location of jsocket.swf, relative to the page.
  *
  * autostart       Boolean. If true, jMUD will attempt to connect as soon as
  *                 the socket is ready.
  *
  * connectonsend   Boolean. If true, jMUD will attempt to connect if the user
  *                 tries to send text while disconnected.
  *
  * autoreconnect   Boolean. If true, jMUD will automatically attempt to
  *                 reconnect when the connection is lost.
  *
  * reconnectdelay  Integer. The amount of time, in milliseconds, for jMUD to
  *                 wait before attempting to reconnect.
  *
  * reconnecttries  Integer. The number of times to attempt to reconnect before
  *                 giving up.
  *
  * inputfg         String. The foreground color to use for displaying player
  *                 input. The fgclass is prepended to this value. So, if you
  *                 set fgclass to 'c' and this to '7', the class on player
  *                 input will be 'c7'. For bright yellow use '11'.
  *
  * inputbg         String. The background color to use for displaying player
  *                 input. The bgclass is prepended to this value. So, if you
  *                 set bgclass to 'b' and this to '0', the class on player
  *                 input will be 'b0'. For black, use '0'.
  *
  * cmdhistory      Boolean. If true and jMUD is managing user input, pressing
  *                 up and down will cycle through a history of recently used
  *                 commands.
  *
  * cmdhistorysize  Integer. The number of recently used commands to remember.
  *
  * multiline       Boolean. If true and jMUD is managing user input, pressing
  *                 Ctrl+Enter will add a new line to the input box, letting the
  *                 user enter multiple lines of commands.
  *
  * clearonsend     Boolean. If true and jMUD is managing user input, the input
  *                 element's value will be cleared when you send text. Otherwise
  *                 its text will be highlighted.
  *
  * windowtitle     Boolean. If true, when a title string is recieved it will
  *                 be set to the document's title.
  *
  * id_socket       String. ID of the element to store the flash socket in. If
  *                 unspecified, one will be created.
  *
  * id_title        String. If specified, when a title string is recieved it
  *                 will be set to the element with the provided ID.
  *
  * id_input        String. If specified, jMUD will use the element with the
  *                 provided ID for player input, automating the process.
  *
  * blurclass       String. Class that will be applied to a managed input
  *                 element when it has default text. Generally, this is used
  *                 to dim initial 'Type here and press enter to connect.'
  *                 messages.
  *
  * connectmessage  String. A message to display in the managed input element
  *                 when it's empty and jMUD is disconnected.
  *
  * emptymessage    String. A message to display in the managed input element
  *                 when it's empty and jMUD is connected to a MUD.
  *
  * handleclear     Boolean. If true, jMUD will clear the output buffer when it
  *                 recieves an ANSI escape code to clear.
  *
  * handlecolor     Boolean. If true, jMUD will process ANSI and XTERM color
  *                 sequences. Else they're ignored.
  *
  * fgclass         String. Prefix of foreground colorization classes for jMUD
  *                 output. Defaults to 'c', resulting in classes like 'c25'
  *
  * bgclass         String. Prefix of background colorization classes for jMUD
  *                 output. Defaults to 'b', resulting in classes like 'b29'
  *
  * debugtelnet     Boolean. If true, telnet sequences will be written to the
  *                 output buffer in a human-readable format.
  *
  * ttypes          Array of Strings. The list of possible TTYPEs that jMUD
  *                 will report from when requested by the server.
  *
  * environ         Associative Array. The list of variables that jMUD will
  *                 report when requested by the server with NEW-ENVIRON.
  *
  * plugin_order    Array of Strings. The order in which jMUD should attempt
  *                 to load its available plugins. This will let you be sure
  *                 to load plugins after their dependencies are already in.
  *
  ***************************************************************************
  * Events
  ***************************************************************************
  * Events are attached to the display element used by jMUD. However, you may
  * attach events to the jMUD object directly. To capture an event, use
  * jQuery's .bind() function. For example, to bind a function for the
  * 'onIACECHO' event, assuming your jMUD object is stored in a variable named
  * 'jmud', use the following:
  *
  * jmud.bind('onIACECHO', function(e) {  code here  });
  *
  *
  * processRecieved   Event called when data is recieved before any processing
  *                   is performed.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.text          String. The raw recieved data.
  *
  *
  * processOutput     Event called before plain text is output to the display.
  *                   You can use this for any custom processing of text, along
  *                   with processRecieved.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.text          String. The raw data that will be added to the display.
  *
  *
  * onText            Event called when a line of text is ready to be displayed.
  *                   This can be used for setting up triggers or gagging
  *                   certain lines, as shown in index.html.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.text          The plain text of the line.
  *   e.html          The text with HTML (color codes mainly) still included.
  *
  *
  * onFinalText       Event called after text is sent to the display element.
  *                   This is useful for attaching events to any elements you
  *                   create if necessary.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.element       DOM Element. The element containing the latest displayed
  *                   text.
  *
  *
  * onSendCommand     Event called when a command is to be sent to the server.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.text          String. The command (without trailing linebreak).
  *
  *
  * onIACECHO         Event called when local ECHO is enabled or disabled. Used
  *                   for making an input element use type="password".
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.echo          Boolean. True if the client should echo user input, false
  *                   if the server will.
  *
  *
  * onIACSwitch       Event called when an unrecognized IAC sequence of
  *                   IAC DO/DONT/WILL/WONT <option> sequence is recieved.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.raw           String. The raw IAC sequence as a string.
  *   e.option        String. Character identifying the telnet option in question.
  *   e.action        String. Character that's one of:  DO, DONT, WILL, WONT
  *
  *
  * onIACSubneg       Event called when an IAC SB <option> <data> IAC SE sequence
  *                   is recieved.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.raw           String. The raw IAC sequence as a string.
  *   e.option        String. Character identifying the telnet option in question.
  *   e.text          String. The text of the subnegotiation, excluding the
  *                   initial IAC SB <option>, as well as the ending IAC SE.
  *
  *
  * onANSI            Event called when an unrecognized ANSI escape sequence is
  *                   recieved.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.raw           String. The raw ANSI sequence as a string.
  *
  *
  * onVarChange       Event called when a variable recieved from the MUD via MSDP
  *                   or NEW-ENVIRON.
  * Properties:
  *   e.jmud          jMUD Instance.
  *   e.key           String. Name of the variable in question.
  *   e.value         Object. The variable's new value. Either an array or
  *                   string.
  *
  *
  * onReady           Event called when the jMUD socket is ready.
  * Properties:
  *   e.jmud          jMUD Instance.
  *
  *
  * onConnected       Event called when jMUD has connected successfully.
  * Properties:
  *   e.jmud          jMUD Instance.
  *
  *
  * onDisconnected    Event called when jMUD has been disconnected.
  * Properties:
  *   e.jmud          jMUD Instance.
  *
  *
  * @return jMUD
  */
  $.fn.mud = function(options) {
    var jmud = $.fn.mud.muds[this.attr('id')];
    if(jmud)
    { // There is a jMUD. Just handle options.
      jmud.options = $.extend(jmud.options, options);
    } else {
      // Build the options array using the defaults and user provided data.
      options = $.extend({}, $.fn.mud.defaults, options);
      
      // Make sure we've got elements for the display and socket. Those
      // are critical.
      options.id_display = this.attr('id');
      
      // If there's no socket element ID, make a new element.
      if (!options.id_socket) {
        options.id_socket = 'jMUDs_' + (++$.fn.mud.last_id);
        $(document.createElement('div')).attr('id',options.id_socket).appendTo('body');
      }
    
      // Make the jMUD object.
      jmud = new jMUD(options);
      
      // Cache jQuery versions of the necessary elements.
      jmud.display  = this;
      jmud.display.data('jmud', jmud);
      jmud.display.addClass('jmud-display');
      
      // Is there a title element? Set the title to nothing then and store the element.
      if (options.id_title) {
        jmud.title  = $('#'+options.id_title);
        jmud.setTitle('');
      }
        
      // Input's a bit trickier, since we have to add an input handler.
      if (options.id_input) {
        jmud.input = $('#'+options.id_input);
        jmud.input.data('jmud', jmud);
        if (options.cmdhistory) {
          jmud.input.keydown(jmud.handleInput).keyup(jmud.handleInputUp);
          jmud.input.attr('title','Type commands here, or use the Up and Down arrows to browse your recently used commands.');
        } else {
          jmud.input.keydown(jmud.handleSimple).keyup(jmud.handleInputUp);
          jmud.input.attr('title','Type commands here.');
        }
        
        // Handle the fancy blur stuff.
        if (jmud.input.val() == '' || jmud.input.val() == options.connectmessage || jmud.input.val() == options.emptymessage) {
          jmud.input.val(options.connectmessage);
          jmud.input.addClass(options.blurclass);
        }
        jmud.input.blur(jmud.handleBlur).focus(jmud.handleBlur);
      }
      
      // Setup the jMUD.
      jmud.setup();
      
      // Initialize jMUD plugins. First, run through plugin_order.
      for(var n = 0; n < options.plugin_order.length; n++) {
        var k = options.plugin_order[n];
        
        var opts = options[k];
        if ( opts !== false && jmud.available_plugins[k] !== undefined) {
          jmud[k] = new jmud.available_plugins[k](jmud, opts);
          if (jmud[k] !== false && jmud[k] !== undefined && jmud[k] !== null)
            jmud.plugins.push(k);
        }
      }
      
      // Run through all the available plugins, loading any that aren't already.
      for (var i in jmud.available_plugins) {
        if (jmud[i] === undefined) {
          var opts = options[i];
          if ( opts !== false ) {
            jmud[i] = new jmud.available_plugins[i](jmud, opts);
            if (jmud[i] !== false && jmud[i] !== undefined && jmud[i] !== null)
              jmud.plugins.push(i);
          }
        }
      }
      
      // Store our element into the dict of jMUDs and sockets.
      $.fn.mud.muds[this.attr('id')] = jmud;
      $.fn.mud.sockets[jmud.socket.id] = jmud;
    }
    return jmud;
  }
  
  $.fn.mud.last_id  = 0;
  $.fn.mud.muds     = {};
  $.fn.mud.sockets  = {};

  $.fn.mud.defaults = {
    port            : 4000,
    policyport      : 843,
    
    swflocation     : 'media/jsocket.swf',
    
    autostart       : true,
    connectonsend   : true,
    
    autoreconnect   : true,
    reconnectdelay  : 2000,
    reconnecttries  : 3,
    
    inputfg         : '7',
    inputbg         : '0',
    
    cmdhistory      : true,
    cmdhistorysize  : 15,
    
    multiline       : true,
    clearonsend     : false,
    
    linecapture     : true,
    windowtitle     : true,
    
    id_socket       : false,
    id_title        : false,
    
    id_input        : false,
    blurclass       : 'mud-input-blur',
    connectmessage  : 'Press enter to connect and type here...',
    emptymessage    : 'Type commands here, or use the Up and Down arrows to browse your recently used commands.',
    
    handleclear     : true,
    handlecolor     : true,
    fgclass         : 'c',
    bgclass         : 'b',
    
    debugtelnet     : false,
    ttypes          : ['jmud','xterm','unknown'],
    environ         : { },
    
    plugin_order    : []
  };
})(jQuery);
