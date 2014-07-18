/*
  jMUD v0.6
  ZMP Core
  
  By: Stendec <stendec365@gmail.com>
  
  This plugin adds ZMP protocol support to jMUD in a way that makes it easy
  to include your own plugins.
  
  You'll want to include your functions like:
  
  .mud().zmp.set("org.sourcemud.test", function(jmud, arguments) {
    // Code Here
  });
  
  That can be done at any point once ZMP is loaded, though you should do that
  straight away. For sending ZMP messages to the server, use:
  
  .mud().zmp.send(command, arguments);
  
  Arguments can be a single value or an array. If an array, NUL bytes will be
  placed between values for you.
  
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

/* jMUD ZMP Core Constructor */
function jMUDZMP(jmud, options) {
  // Save a copy of jMUD.
  this.jmud = jmud;
  
  // Some state variables.
  this.enabled = false;
  
  // Hook our functions into jMUD
  this.jmud.bind('onIACSwitch', this.onIACSwitch);
  this.jmud.bind('onIACSubneg', this.onIACSubneg);
}

/* The ZMP Telopt Character */
jMUDZMP.prototype.ZMP = String.fromCharCode(93);

/* A place to store avaliable packages. */
jMUDZMP.prototype.packages = {};

/* Handle a telopt switch command */
jMUDZMP.prototype.onIACSwitch = function(e) {
  // Get jMUDZMP
  var jzmp = e.jmud.zmp;
  
  // Make shortcuts to a few useful variables.
  var ZMP = jzmp.ZMP;
  var IAC = e.jmud.telopt.IAC;
  var DO = e.jmud.telopt.DO;
  var WILL = e.jmud.telopt.WILL;
  var WONT = e.jmud.telopt.WONT;
  
  // Make sure this is dealing with ZMP, otherwise quit.
  if (e.option != ZMP)
    return;
    
  // If it's a WILL ZMP switch, reply with DO ZMP
  if (e.action == WILL) {
    jzmp.enabled = true;
    e.jmud.sendIAC(IAC + DO + ZMP);
    jzmp.send('zmp.ident', ['jMUD',e.jmud.version,'A MUD client for browsers written in JavaScript.']);
  } else if (e.action == WONT) {
    e.jmud.sendIAC(IAC + DONT + ZMP);
    jzmp.enabled = false;
  }
  
  // Prevent jMUD from sending a default response
  e.preventDefault();
}

/* Handle incoming subnegotiation data */
jMUDZMP.prototype.onIACSubneg = function(e) {
  // Get jMUDZMP
  var jzmp = e.jmud.zmp;
  
  // Is ZMP disabled? Quit right off. Also quit if this isn't a ZMP packet.
  if (!jzmp.enabled || e.option != jzmp.ZMP)
    return;

  // Split our string by NUL bytes
  var args = e.text.split(/\x00/);

  // Do we have data? If not, return.
  if (args.length < 1 || args[args.length-1] != '')
    return;
  
  // Pop the empty string off the end
  args.pop();
  
  // Get the function. If it's undefined or not a function, quit.
  var func = jzmp.get(args.shift());
  if (func === undefined || typeof func != 'function') return;
  
  // Still here? It's a valid command then. Call it.
  func(e.jmud, args);
}

/* Helper function to set a specific function to a path. Fills out the path
   if necessary. */
jMUDZMP.prototype.set = function(path, handler) {
  // Split our path
  var path = path.split('.');
  
  // Pop the command name off the end
  var cmd = path.pop();

  // Loop through path, creating arrays as necessary
  var obj = this.packages;
  while (path.length > 0) {
    // Shift the element off the start of the array.
    var key = path.shift();
    
    // Create a new list if necessary
    if (obj[key] === undefined)
      obj[key] = {};
    
    // Store the new object into obj.
    obj = obj[key];
  }
  
  // Add our command to obj.
  obj[cmd] = handler;
}

/* Helper function to get a specific function in a package. */
jMUDZMP.prototype.get = function(path) {
  // Split our path.
  var path = path.split('.');

  // Loop through all possibilities
  var obj = this.packages;
  while (path.length > 0) {
    // Shift the element off the start of the array.
    var key = path.shift();
  
    // Is this the last item? If so, it's a command. Otherwise check to see if
    // it's a valid package.
    if (path.length == 0) {
      if (key == '') return obj;
      return obj[key];
    } else {
      obj = obj[key];
      if (obj === undefined) return undefined;
    }
  }
}

/* A shortcut for easy sending of ZMP responses. */
jMUDZMP.prototype.send = function(cmd, args) {
  // Make sure ZMP is enabled.
  if (!this.enabled)
    return;
  
  // Declare some shortcuts.
  var IAC = this.jmud.telopt.IAC;
  var SB  = this.jmud.telopt.SB;
  var SE  = this.jmud.telopt.SE;
  var ZMP = this.ZMP;
  
  // If args is an array, join it via NUL.
  if (typeof args == 'object')
    args = args.join('\x00');
  
  // Send it
  this.jmud.sendIAC(IAC + SB + ZMP + cmd + "\x00" + args + '\x00' + IAC + SE);
}

/* Core Commands Implementation */
jMUDZMP.prototype.packages['zmp'] = {
  'check'	: function(jmud, args) {
    if (args.length < 1) return;
    var jzmp = jmud.zmp;
    
    // Get the command / package
    func = jzmp.get(args[0]);
    
    // Is it unavailable?
    if (func === undefined)
      // Not available.
      jzmp.send("zmp.no-support", args[0]);
    else
      // It exists. Okay then.
      jzmp.send("zmp.support", args[0]);
  },
  'ping'	: function(jmud, args) {
    // Isn't this inelegant? JavaScript's date handling sucks. And sprintf would be appreciated.
    var current = new Date();
    var yr = current.getUTCFullYear().toString();
    var mn = (current.getUTCMonth() + 1).toString();
    if (mn.length == 1) mn = '0' + mn;
    var dy = current.getUTCDate().toString();
    if (dy.length == 1) dy = '0' + dy;
    var hr = current.getUTCHours().toString();
    if (hr.length == 1) hr = '0' + hr;
    var mi = current.getUTCMinutes().toString();
    if (mi.length == 1) mi = '0' + mi;
    var sc = current.getUTCSeconds().toString();
    if (sc.length == 1) sc = '0' + sc;
    
    jmud.zmp.send("zmp.time", yr + '-' + mn + '-' + dy + ' ' + hr + ':' + mi + ':' + sc)
  }
}

// And now, the magic. Hook it into jMUD
jMUD.prototype.available_plugins['zmp'] = jMUDZMP;