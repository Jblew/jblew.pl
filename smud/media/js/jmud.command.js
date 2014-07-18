/*
  jMUD v0.5
  Command Core
  
  By: Stendec <stendec365@gmail.com>
  
  The command core provides an extensible way to add a client command system
  to jMUD, though it isn't required to use jMUD. It allows you to give the
  client commands by prefixing them with an # character, or another character
  of your choice.
  
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

// Extend string with a repeat function
if (!String.prototype.repeat) {
  String.prototype.repeat = function( num )
  {	return new Array( num + 1 ).join( this ); }
}

// Splitter Regex
jMUDCommand.prototype.split_reg = XRegExp("(\"[^\"]+\"|'[^']+'|[^ ]+)","g");

/* Default Settings */
jMUDCommand.prototype.settings = {
  'trigger' : '#'
};

/* jMUD Command Core Constructor */
function jMUDCommand(jmud, options) {
  // Save a copy of jMUD.
  this.jmud = jmud;
  
  // Build our options array out of the defaults and what was provided.
  this.options = jQuery.extend(jMUDCommand.prototype.settings, options);
  
  // Hook our functions into jMUD.
  this.jmud.bind('onSendCommand', this.processCommand);
}

/* A place to store avaliable commands. */
jMUDCommand.prototype.commands = {};

/* Process Incoming Text
 * If the message starts with our trigger, handle it. Check the available
 * commands and, if one matches, call it.
 */
jMUDCommand.prototype.processCommand = function(e) {
  // Get jMUDCommand
  var jcmd = e.jmud.command;
  var t = jcmd.options.trigger;
  
  // Return if this doesn't match our trigger. Otherwise, prevent it from
  // getting sent right off the start.
  if (e.text.substr(0,t.length) != t) return;
  e.preventDefault();
  e.text = e.text.substr(t.length);
  
  // Split the string, obeying any quotes.
  var args = [];
  jcmd.split_reg.lastIndex = 0;
  var m = jcmd.split_reg.exec(e.text);
  while (m != null) {
    if (m[0][0] == '"' || m[0][0] == "'") m[0] = m[0].substr(1);
    if (m[0].endsWith('"') || m[0].endsWith("'")) m[0] = m[0].substr(0,m[0].length-1);
    args.push(m[0]);
    m = jcmd.split_reg.exec(e.text);
  }
  
  // Pop the command itself off the front and lowercase it.
  var cmd = args.shift().toLowerCase();
  
  // If the command exists, call it. Else report an error.
  var c = jcmd.commands[cmd];
  if (c !== undefined) {
    e.jmud.mssg(t + e.text, undefined, false);
    c(e.jmud, args);
  } else
    e.jmud.mssg('Unknown command.');
}

/* Commands List Command */
jMUDCommand.prototype.commands['help'] = function(jmud, args) {
  var cmds = [];
  for (var i in jmud.command.commands)
    cmds.push(i);

	jmud.mssg('The following plugins are loaded: ' + jmud.plugins.join(', '));
  jmud.mssg('The following commands are available: ' + cmds.join(', '));
};

/* Configuration Command */
jMUDCommand.prototype.commands['config'] = function(jmud, args) {
  if ( args.length == 0 ) {
    // List all configuration settings.
    var sz = jmud.getSize();
    var out = 'Option           Value            Description<br>';
    out +=    '-'.repeat(sz.cols-1) + '<br>';
    for (var i in jmud.command.config) {
      // Output the name and spacing.
      out += i;
      if ( i.length < 17 ) out += ' '.repeat(17-i.length);
      
      // Is this a more advanced option, or a simple one?
      if (typeof jmud.command.config[i] == 'string') {
        // Simple. Assume value is in jmud.options
        val = jmud.options[i].toString();
        out += val;
        if ( val.length < 17 ) out += ' '.repeat(17-val.length);
        out += jmud.command.config[i];
      } else {
        // Advanced. Use get/set functions.
        val = jmud.command.config[i].get(jmud).toString();
        out += val;
        if ( val.length < 17 ) out += ' '.repeat(17-val.length);
        out += jmud.command.config[i].description;
      }
      out += '<br>';
    }
    jmud.mssg(out.replace(/ /g,'&nbsp;'));
  }
  
  else if ( args.length == 1 ) {
    // Make sure it exists.
    var opt = jmud.command.config[args[0]];
    if (opt === undefined) {
      jmud.mssg('No such option exists.<br />');
      return;
    }
  
    // List the syntax for a specific thing.
    if(typeof opt == 'string')
      val = jmud.options[args[0]];
    else
      val = opt.get(jmud);
    
    // Set the basic message.
    var out = 'Syntax: ' + jmud.command.options.trigger + 'config "' + args[0] + '" ';
    
    // Depending on the type, show different options.
    switch(typeof val) {
      case 'boolean': out += '&lt;true|false&gt;'; break;
      default:        out += typeof val + ' - &lt;value&gt;'; break;
    }
    
    jmud.mssg(out + '<br />');
  }
  
  else {
    // Make sure it exists.
    var o = args.shift();
    var opt = jmud.command.config[o];
    if (opt === undefined) {
      jmud.mssg('No such option exists.<br />');
      return;
    }
    
    // Get the current value
    if(typeof opt == 'string') val = jmud.options[o];
    else val = opt.get(jmud);
    
    // Depending on the type, accept different input.
    switch(typeof val) {
      case 'boolean':
        var a = args[0].toLowerCase();
        if (a == 'yes' || a == 'true' || a == 'on') val = true;
        else if (a == 'no' || a == 'false' || a == 'off') val = false;
        break;
      case 'number':
        val = parseInt(args[0]);
        break;
      default:
        val = args.join(' ');
        break;
    }
    
    // Set the variable.
    if (typeof opt == 'string') jmud.options[o] = val;
    else opt.set(jmud, val);
    
    jmud.mssg(o + " is now "+val+".<br />");
  }
}

/* Available Configuration Settings */
jMUDCommand.prototype.config = {
  'debugtelnet'     : 'If true, jMUD will echo TELNET negotiations.',
  'handleclear'     : 'If true, jMUD will obey ANSI clear screen codes by emptying the output buffer.',
  'handlecolor'     : 'If true, jMUD will parse ANSI/XTERM color codes.',
  'reconnecttries'  : 'The number of times jMUD will try reconnecting before giving up.',
  'trigger'         : {
    'description' : 'The character to trigger client commands.',
    'get'         : function(jmud) { return jmud.command.options.trigger; },
    'set'         : function(jmud,val) { jmud.command.options.trigger = val; }}
};

// And now, the magic. Hook it into jMUD
jMUD.prototype.available_plugins['command'] = jMUDCommand;