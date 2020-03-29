/*
  jMUD v0.5
  MXP Processor
  
  By: Stendec <stendec365@gmail.com>
  
  This plugin provides support for MXP to the client.
  
  Copyright (c) 2009 Stendec <stendec365@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the \"Software\"), to deal
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

// Parser Regex
jMUDMXP.prototype.parser  = XRegExp("([^<]*)(?:<!--.*?-a->|<!(EN(?:TITY)?|AT(?:TLIST)?|EL(?:EMENT)?)(?:\\s+([^\\s]+)\\s+((['\"]).*?\\5|[^=>\\s]+(?:=(['\"]).*?\\6|[^\\s>]+)?))\\s*?>|<(/?)([^\\s>]+)(?:\\s+([^>]*))?>)?", "sg");
jMUDMXP.prototype.tag_reg = XRegExp("<([^\\s>]*)\\s*([^>]*)>","g");
jMUDMXP.prototype.att_reg = XRegExp("(?:(['\"])(.+?)\\1|([^\\s=]+))(?:=(['\"])(.*?)\\4|=([^\\s]+))?\\s*","g");
jMUDMXP.prototype.ent_reg = XRegExp("&(?:amp;)?([^;]+);","g");
jMUDMXP.prototype.sup_reg = XRegExp("(?:(['\"])([^\\.]*?)(?:\\.(.*?))?\\1|([^\\s\\.]+)(?:\\.([^\\s]+))?)\\s*","g");

/* Default Settings */
jMUDMXP.prototype.settings = {
  // Gasp! There are none!
};

/* MXP Expire Handler */
jMUDMXP.prototype.expire = function(key) {
  jQuery(".jmud-display").find('a.mxp-expire-'+key).each(function() {
    var $this = $(this);
    var s = document.createTextNode($this.text());
    $this.parent()[0].replaceChild(s, this);
  });
}

/* jMUD MXP Handler Constructor */
function jMUDMXP(jmud, options) {
  // Save a copy of jMUD.
  this.jmud = jmud;
  
  // Build our options array out of the defaults and what was provided.
  this.options = jQuery.extend({}, jMUDMXP.prototype.settings, options);
  
  // MXP State.
  this.enabled    = false;
  this.locked     = false;
  this.temp       = false;
  this.mode       = 0;
  this.def        = 0;
  this.out        = '';
  this.incomplete = '';
  this.entities   = {};
  
  // Open Tags
  this.open     = [];
  this.want     = false;
  this.caught   = [];
  this.content  = [];
  this.args     = [];
  
  // Hook our functions into jMUD.
  this.jmud.bind('onIACSwitch', this.onIACSwitch);
  this.jmud.bind('onANSI', this.onANSI);
  this.jmud.bind('processOutput', this.processOutput);
  this.jmud.bind('onText', this.onText);
  
  // Add our content handler for links
	$(".jmud-display a.mxp-internal").live("mousedown", this.internalClick);
  $(".jmud-display a.mxp-internal").live("click", function() { return false; });
  $(".jmud-display a.mxp-external").live("click", this.verifyAway);
  $("ul.mxp-send-menu li a").live("click", this.handleSENDMENU);
  $(".jmud-display a.mxp-internal img.mxp-image-map").live("click", this.imageMap);
  
  // Set the default colors of <COLOR>
  this.tags['COLOR'].arguments['defforeclass'] = this.jmud.options.fgclass + '7';
  this.tags['COLOR'].arguments['defbackclass'] = this.jmud.options.bgclass + '0';
	
	// Override the color function
	this.jmud.outColorOld = this.jmud.outColor;
	this.jmud.outColor = function(closing, ret) {
		var col = this.outColorOld(closing, true);
		if (ret == true) return col;
		
		if (this.mxp.temp) {
      this.mxp.temp = false;
      this.mxp.mode = this.mxp.def;
    }
		
		if (this.mxp.enabled && this.mxp.caught.length > 0)
			this.mxp.outText(col);
		this.outbuf.push(col);
	};
};

// Handle <A> Events
jMUDMXP.prototype.verifyAway = function(e) {
  if (e.button != 0) return;
  var $this = $(this);
  var cnf = confirm('Clicking this link will open a new window away from the MUD to:\r\n\r\n'+this.href+'\r\n\r\nAre you sure?');
  if (!cnf)
    return false;
}

// Handle <IMAGE ISMAP> Clicks
jMUDMXP.prototype.imageMap = function(e) {
  // Don't do right-clicks.
  if (e.button != 0) return;
  
  // Get this and jmud
  var $this = $(this);
  var display = $this.closest('.jmud-display');
	var jmud = display.data('jmud');
  
  // Calculate the click position
  var hiddenX = display.scrollLeft();
  var hiddenY = display.scrollTop();
  var x = e.pageX - (this.offsetLeft - hiddenX);
  var y = e.pageY - (this.offsetTop - hiddenY);
  
  // Get the link
  var link = $this.closest('a.mxp');
  
  if (link !== undefined) {
    var href = link.attr('href');
    if (href.indexOf('|') > -1)
      href = href.split('|')[0];
  
    href += '?' + x + ',' + y;
  
    if (link.hasClass('mxp-prompt')) {
      jmud.input.value(href);
      jmud.input.focus();
    } else
      jmud.send(href);
  }
  return false;
}

// Handle SEND Menu Clicks
jMUDMXP.prototype.handleSENDMENU = function(e) {
  if (e.button == 2 || e.button == 1) {
    // Destroy the menu.
    jQuery("ul.mxp-send-menu").remove();
    jQuery(document).unbind('click.mxp-send-menu');
    return false;
  }
  if (e.button != 0) return;
  var $this = $(this);
  var menu = $this.closest('.mxp-send-menu');
  var jmud = menu.data('jmud');
  
  var cmd = $this.attr('href');
  
  if (menu.hasClass('mxp-prompt')) {
    jmud.input.val(cmd + ' ');
    jmud.input.focus();
  } else
    jmud.send(cmd);
  
  return false;
}

// Handle <SEND> Clicks
jMUDMXP.prototype.internalClick = function(evt) {
	this.oncontextmenu = function() { return false; }
	jQuery(this).mouseup(function(e) {
		var $this = jQuery(this);
		$this.unbind('mouseup');
		setTimeout(function() {
		
		// Bleh. Trapping right clicks sucks.
		var jmud = $this.closest('.jmud-display').data('jmud');
		
		// Make a list of commands from href
		var cmds = $this.attr('href').split('|');
		
		// If it's left button, simply send the command.
		if (e.button == 0) {
			if ($this.hasClass('mxp-prompt') && jmud.input != null && jmud.input !== undefined) {
				jmud.input.val(cmds[0] + ' ');
				jmud.input.focus();
			} else
				jmud.send(cmds[0]);
		}
		
		// Is it a right click. Display the SEND Menu
		else if (e.button == 2) {
			var $menu = jQuery(document.createElement('ul'));
			$menu.data('jmud',jmud);
			$menu.addClass('mxp').addClass('mxp-send-menu');
			
			// Keep track of mxp-prompt
			if ($this.hasClass('mxp-prompt'))
				$menu.addClass('mxp-prompt');
			
			// If our descriptive text is longer than the command line, shift the first off
			var dtxt = $this.attr('name').split('|');
			if (dtxt.length > cmds.length) dtxt.shift();
			
			// Generate the menu.
			for(var n = 0; n < cmds.length; n++) {
				// Do we have a description? If not, just echo the text to send.
				var desc = dtxt[n];
				if (desc === undefined || desc == '') desc = cmds[n];
				$menu.append('<li><a class="mxp" href="'+cmds[n]+'">'+desc+'</a></li>');
			}
			
			// Position the menu.
			$menu.css('top', e.pageY).css('left', e.pageX);
			
			// Add our menu to the body
			jQuery(document.body).append($menu);
			
			// Start the click handler after a short timeout to make sure the browser
			// doesn't freak out and instantly destroy our precious menu.
			setTimeout(function() {
				jQuery(document).bind('click.mxp-send-menu', function() {
					jQuery("ul.mxp-send-menu").remove();
					jQuery(document).unbind('click.mxp-send-menu');
				});
			}, 5);
		}
	},1);
	});
	
	return false;
}

// Parse Arguments
jMUDMXP.prototype.parseArgs = function(text, ord, is_att) {
  if (is_att !== true) is_att = false;
  if (ord === undefined) ord = [];
  
  // Declare our variables for data storage
  var content = '';
  var args = {};
  var order = [];
  
  // Loop through, parsing everything
  this.att_reg.lastIndex = 0;
  var m = this.att_reg.exec(text);
  var ind = 0;
  while (m != null && m[0] != '') {
    var name = m[2];
    if (name === undefined) name = m[3];
    if (name !== undefined) {
      // We have a name. Get a value.
      var value = m[5];
      if (value === undefined) value = m[6];
      if (value !== undefined || ord.contains(name.toLowerCase())) {
        // We have a value. Simply store it in args and add an entry to order.
        name = name.toLowerCase();
        if (value === undefined) value = true;
        args[name] = value;
        order.push(name);
      } else {
        // No value. If we're in is_att mode, it's a possible argument. Otherwise
        // treat it as a value.
        if (is_att) {
          args[name.toLowerCase()] = '';
          order.push(name);
        } else if (typeof ord == 'object' && ord.length > ind) {
          args[ord[ind]] = name;
          order.push(ord[ind]);
          ind++;
        } else {
          content = name;
        }
      }
    }
    m = this.att_reg.exec(text);
  }
  
  return [content, args, order];
}

// Handle ENTITY
jMUDMXP.prototype.processENTITY = function(name, args) {
  // Convert name to lowercase.
  name = name.toLowerCase();
  
  // Parse the arguments
  args = this.parseArgs(args,['value','desc','private','publish','delete','add','remove']);
  
  var priv = false;
  var value = args[1].value;
  
  if (this.entities[name] !== undefined)
    var old_value = this.entities[name];
  else
    var old_value = [];
  
  if (typeof old_value != 'object')
    old_value = old_value.split('|');
  
  if (args['private'] !== undefined) priv = true;
  if (args['public'] !== undefined) priv = false;
  if (args['add'] !== undefined || args['remove'] !== undefined) {
    if (args['add'] !== undefined)
      old_value.push(value);
    if (args['remove'] !== undefined)
      old_value.removeItem(value);
    if (old_value.length > 1)
      value = old_value;
    else if (old_value.length > 0)
      value = old_value[0];
    else
      value = '';
  }
  if (args['delete'] !== undefined) value = undefined;
  this.entities[name] = value;
  
  // If it's public, set a variable
  if (!priv)
    this.jmud.setVariable(name, value);
}

// Handle <SUPPORT> Tags
jMUDMXP.prototype.handleSUPPORT = function(tag, args) {
  var out = '<SUPPORTS';
  
  if (args === undefined) {
    // No arguments. Just add all our default tags to the list.
    for (var i in this.tags) {
      if (this.tags[i]['default'])
        out += ' +' + i;
    }
  } else {
    // Read through the supplied arguments and build our string that way.
    this.sup_reg.lastIndex = 0;
    var m = this.sup_reg.exec(args);
    while (m != null && m[0] != '') {
      if (m[2] !== undefined) {
        var tag = m[2];
        var arg = m[3];
      } else if (m[4] !== undefined) {
        var tag = m[4];
        var arg = m[5];
      }
      
      // Make sure we've got a valid tag
      if (this.tags[tag.toUpperCase()] === undefined || this.tags[tag.toUpperCase()]['default'] !== true) {
        out += ' -' + tag;
      } else {
        if (arg === undefined) {
          // Tag only.
          out += ' +' + tag;
        } else {
          // Property. 
          var t = this.tags[tag.toUpperCase()];
          
          if (arg == '*') {
            // All Arguments
            for (var i in t.arguments) {
              if (t.arguments[i] !== undefined)
                out += ' +' + tag + '.' + i;
            }
          } else {
            // Specific Arguments
            if (t.arguments[arg] === undefined)
              out += ' -' + tag + '.' + arg;
            else
              out += ' +' + tag + '.' + arg;
          }
        }
      }
      
      m = this.sup_reg.exec(args);
    }
  }
  
  out += '>';
  this.jmud.send('\x1b[1z' + out,true,true);
}

// Handle ATTLIST
jMUDMXP.prototype.processATTLIST = function(tag, args) {
  // Convert tag to upper case.
  var tag = tag.toUpperCase();

  // Get the tag. Abort if it doesn't exist.
  var t = this.tags[tag];
  if (t === undefined) return;
  
  // If args is quoted, strip them away.
  if ((args[0] == '"' && args.endsWith('"')) || (args[0] == "'" && args.endsWith("'")))
    args = args.substr(1, args.length - 2);
  
  // Parse the arguments.
  var tmp = this.parseArgs(args, undefined, true);
  t.arguments = tmp[1];
  t.arg_order = tmp[2];
}

// Handle ELEMENT
jMUDMXP.prototype.processELEMENT = function(tag, args, def, rep) {
  if (def === undefined) def = false;
  if (rep === undefined) rep = false;
  
  // Convert tag to upper case.
  var tag = tag.toUpperCase();
  
  // Build the default settings.
  this.tags[tag] = {
    'secure'      : true,
    'want'        : false,
    'default'     : def,
    'no_close'    : false,
    'reprocess'   : rep,
    'constructor' : '<!ELEMENT '+tag+' '+args+'>',
    
    'open_tag'    : '',
    'close_tag'   : '',
    'arguments'   : {},
    'arg_order'   : []
  };

  // Store it in an easy-access variable.
  var t = this.tags[tag];

  // Parse the arguments.
  var args = this.parseArgs(args);
  var content = args[0];

  // Is there content to replace it with?
  if (content !== undefined) {
    t.open_tag = content;
    t.reprocess = true;
  }
  
  // If open_tag is set, build close_tag
  if (t.open_tag != '' && typeof t.open_tag == 'string') {
    this.tag_reg.lastIndex = 0;
    var m = this.tag_reg.exec(t.open_tag);
    while (m != null && m[0] != '') {
      t.close_tag += '</' + m[1] + '>';
      m = this.tag_reg.exec(t.open_tag);
    }
  }

  // Store arguments in args.
  args = args[1];
  
  // Handle common arguments
  if (args.att !== undefined) {
    var tmp = this.parseArgs(args.att, undefined, true);
    t.arguments = tmp[1];
    t.arg_order = tmp[2];
  }
  if (args.tag !== undefined) t.tag = args.tag;
  if (args.flag !== undefined) { t.flag = args.flag; t.want = true; }
  if (args.open === true) t.secure = false;
  if (args.empty === true) t.open_tag = '';
  if (args['delete'] === true) {
    delete this.tags[tag];
    return;
  }
}

// Process Output
jMUDMXP.prototype.processOutput = function(e) {
  var mxp = e.jmud.mxp;
  if (!mxp.enabled) return;

  mxp.out = '';
  
  // Is there an incomplete tag? Push it to the start of text.
  if (mxp.incomplete != '') {
    e.text = mxp.incomplete + e.text;
    mxp.incomplete = '';
    
    // Push a color tag, just in case.
    e.jmud.outColor(false);
  }

  // Do we have any tags?
  if (!(/</.test(e.text))) {
    mxp.outText(e.text.replace(/ /g,'&nbsp;'));
    if (mxp.temp) {
      mxp.temp = false;
      mxp.mode = mxp.def;
    }
    e.preventDefault();
    return mxp.out;
  }

  // Parse the text.
  mxp.parser.lastIndex = 0;
  var m = mxp.parser.exec(e.text);
  while (m != null && m[0] != '') {
    // Is there plain text?
    if (m[1] != '') {
      mxp.outText(m[1].replace(/ /g,'&nbsp;'));
      
      if (mxp.temp) {
        mxp.temp = false;
        mxp.mode = mxp.def;
      }
    }
  
    // Is there an ELEMENT, ATTLIST, or ENTITY tag and we're secure?
    if (m[2] !== undefined && mxp.mode == 1) {
      if (m[2] == 'EL' || m[2] == 'ELEMENT') {
        // Element
        mxp.processELEMENT(m[3], m[4]);
      }
    
      else if (m[2] == 'AT' || m[2] == 'ATTLIST') {
        // ATTLIST
        mxp.processATTLIST(m[3], m[4]);
      }
    
      else if (m[2] == 'EN' || m[2] == 'ENTITY') {
        // Entity
        mxp.processENTITY(m[3], m[4]);
      }
    
      if (mxp.temp) {
        mxp.temp = false;
        mxp.mode = mxp.def;
      }
    }
  
    // Is there a normal tag and we're not locked?
    if (m[8] !== undefined && mxp.mode != 2) {
      m[8] = m[8].toUpperCase();
      var t = mxp.tags[m[8]];
      
			// Does the tag not exist? Output it as text.
			if (t === undefined) {
				if (m[9] != '')
					mxp.outText('&lt;' + m[8] + ' ' + m[9] + '&gt;');
				else
					mxp.outText('&lt;' + m[8] + '&gt;');
			
      // Is tag <SUPPORT>?
      } else if (m[8] == 'SUPPORT' && mxp.mode == 1) {
        mxp.handleSUPPORT(m[8], m[9]);
      
      // If the tag requires security, make sure we're secure
      } else if (mxp.mode == 1 || t.secure == false) {
        // The tag exists. Build our arguments.
        if (m[9] !== undefined) {
          var tmp = mxp.parseArgs(m[9], t.arg_order);
          var content = tmp[0];
          var args = tmp[1];
        } else {
          var args = {};
          var content = '';
        }
        
        // Add the defaults for the tag to arguments.
        args = jQuery.extend({}, t.arguments, args);
        
        // Should the tag be reprocessed or not?
        if (t.reprocess) {
          // If we're closing append the close_tag, else append open_tag
          if (m[7] == '/')
            var tx = t.close_tag;
          else
            var tx = t.open_tag;

          // Replace characters
          args['text'] = '&text;';
          tx = mxp.replaceEntities(tx, args);

          e.text = e.text.substr(0, mxp.parser.lastIndex - (m[0].length - m[1].length)) + tx + e.text.substr(mxp.parser.lastIndex);
          mxp.parser.lastIndex = mxp.parser.lastIndex - (m[0].length - m[1].length);
        } else {
          // Handle the tag. Are we closing?
          if (m[7] == '/') {
            // Starting at the top, loop down through the open tags until we close
            // this one.
            while (mxp.open.length > 0) {
              var tg = mxp.closeTag();
              if (tg == m[8])
                break;
            }
          } else {
            // Opening Tag.
            if (!t.no_close && (mxp.want || t.want || content.indexOf('&text;') >= 0)) {
              // Don't output the tag now. Wait until the closing.
              mxp.caught.push('');
              mxp.content.push(content);
              mxp.args.push(args);
              mxp.want = true;
            } else {
              // Output the tag now.
              // Does the tag have a handler?
              if (t.handler !== undefined) {
                // Use the tag's handler.
                var txt = t.handler(mxp.jmud, m[8], content, args, '');
                if (txt !== undefined) {
                  mxp.outText(txt);
                } else {
                  mxp.outText(mxp.replaceEntities(t.open_tag, args))
                }
              } else {
                mxp.outText(mxp.replaceEntities(t.open_tag, args));
              }
            }
            
            // If the tag wasn't no_close, push it to the open stack.
            if (!t.no_close)
              mxp.open.push(m[8]);
          }
        }
      }
    }
  
    if (mxp.temp) {
      mxp.temp = false;
      mxp.mode = mxp.def;
    }
    m = mxp.parser.exec(e.text);
  }

  // Is there anything on the stack? That could only happen if we have an incomplete
  // tag, so add that to mxp.incomplete so we get it next time round. Though, it could
  // also happen if there's a spare < or > character, so don't let this get too long.
  if (e.text.length != mxp.parser.lastIndex) {
    if (e.text.length - mxp.parser.lastIndex < 100)
      mxp.incomplete = e.text.substr(mxp.parser.lastIndex);
  }

  e.preventDefault();
  return mxp.out;
}

jMUDMXP.prototype.closeTag = function() {
  // Close the top tag off of the stack and return what it was.
  var t = this.open.pop();
  
  // Get the tag. If it's undefined, return.
  var tag = this.tags[t];
  if (tag === undefined) return t;
  
  // Is want mode enabled?
  if (this.want) {
    // Pop the caught text, content, and args off the stack.
    var caught = this.caught.pop();
    var content = this.content.pop();
    var args = this.args.pop();
    
    // Is caught empty? No more want = true then.
    if (this.caught.length == 0) this.want = false;
    
    // Set the text argument.
    args['text'] = caught;
    
    // Process arguments for entity use.
    for (var a in args) {
      if (typeof args[a] == 'string')
        args[a] = this.replaceEntities(args[a], args);
    }
    
    // Replace content
    content = this.replaceEntities(content, args);
     
    // Does the tag have a handler?
    if (tag.handler !== undefined) {
      // Use the tag's handler.
      var txt = tag.handler(this.jmud, t, content, args, caught);
      if (txt !== undefined) {
        if (this.out.endsWith(caught)) this.out = this.out.substr(0, this.out.length - caught.length);
        this.outText(txt);
        return t;
      } else {
        // Make sure we aren't doubling the output.
        if (tag.open_tag == '')
          return t;
      }
    }
    
    // Still here? Output the old fashioned way then.
    if ( tag.open_tag != '' ) {
      var txt = caught.split('<br />').pop();
      if (this.out.endsWith(txt)) this.out = this.out.substr(0, this.out.length - txt.length);
      this.outText(this.replaceEntities(tag.open_tag, args) + caught + tag.close_tag);
    } else {
      this.outText(caught);
    }
  } else {
    this.outText(tag.close_tag);
  }
  return t;
}

jMUDMXP.prototype.outText = function(text) {
  // Add it to caught if necessary.
  if (this.want || this.caught.length > 0) {
    var i = this.caught.length;
    while(--i >= 0)
      this.caught[i] += text;
  }
  this.out += text;
}

jMUDMXP.prototype.replaceEntities = function(text, args) {
  // Extend entities with args
  args = jQuery.extend({},this.entities, args);
  
  return text.replace(this.ent_reg, function($0,$1) {
    if ($1 == 'hintone') {
      var v = args['hint'];
      if (v !== undefined) {
        if (v.indexOf('|'))
          v = v.split('|')[0];          
        return v.replace(/"/g,"&quot;");
      } else { return ''; }
    } else if ($1.indexOf(':') >= 0) {
      // Boolean flag-type entity
      $1 = $1.split(':');
      if (args[$1[0]] == true && $1[1] !== undefined)
        return $1[1];
      else if (args[$1[0]] == false && $1[2] !== undefined)
        return $1[2];
      else if (args[$1[3]] !== undefined)
        return $1[3];
      else
        return '';
    } else {
      var v = args[$1];
      if (v !== undefined) return v.replace(/"/g,"&quot;");
      return '';
    }
  });
}

// ANSI Handler
jMUDMXP.prototype.onANSI = function(e) {
  // Get the code, make sure it ends with z.
  var mxp = e.jmud.mxp;
  
	if (mxp.temp) {
		mxp.temp = false;
		mxp.mode = mxp.def;
	}
	
  var a = e.raw.substr(2);
  if (a[a.length-1] != 'z') return;
  a = a.substr(0,a.length-1);
  
  // What is it?
  switch (a) {
    case '0': // Open Line
      mxp.mode = 0;
      break;
    case '1': // Secure Line
      mxp.mode = 1;
      break;
    case '2': // Locked Line
      mxp.mode = 2;
      break;
    case '3': // Reset
      while(mxp.open.length > 0)
        var t = mxp.closeTag();
      mxp.temp = false;
      mxp.mode = 0;
      break;
    case '4': // Temporary Secure Mode
      mxp.temp = true;
      mxp.mode = 1;
      break;
    case '5': // Lock Open Mode
      mxp.locked = false;
      mxp.mode = 0;
      mxp.def = 0;
      break;
    case '6': // Lock Secure Mode
      mxp.locked = true;
      mxp.mode = 1;
      mxp.def = 1;
      break;
    case '7': // Lock Locked Mode
      mxp.locked = true;
      mxp.mode = 2;
      mxp.def = 2;
      break;
  }
}

// On Line of Text
jMUDMXP.prototype.onText = function(e) {
  var mxp = e.jmud.mxp;

  // Does MXP want? Reset all caughts so we don't have to worry about removing
  // a bunch of text from the previous line.
  if (mxp.caught.length > 0) {
    var i = mxp.caught.length - 1;
    var txt = mxp.caught[0];
    
    // Add a new line to our captured text.
    mxp.outText('<br />');
    
    // Replace spaces with &nbsp; outside of elements and remove any initial color tags.
    txt = e.html.replace(/((?:<[^>]+>)*)([^\\s<]*)\\s/g,'$0$1&nbsp;').replace(/^<\/span><span class="[^"]*">/,'').split('<br />');
    txt = txt.pop();
    
    // Remove our string from the end of html if we can.
    if (e.html.endsWith(txt))
      e.html = e.html.substr(0,e.html.length - txt.length);
    
    // If html consists only of a color tag, push it to the buffer and don't show this line
    if (/^<\/span><span class="[^"]*">$/.test(e.html)) {
      e.jmud.linesbuf.push(e.html);
      e.preventDefault();
    }
    
    return;
  }
  
  // Revert to the default mode if not locked.
  if (mxp.locked && mxp.mode != mxp.def)
    mxp.mode = mxp.def;
}

// TELOPT Switch Handler
jMUDMXP.prototype.onIACSwitch = function(e) {
  // If it's not MXP, we don't care. Ignore it.
  var MXP = e.jmud.telopt.MXP;
  var IAC = e.jmud.telopt.IAC;
  var DO = e.jmud.telopt.DO;
  var WILL = e.jmud.telopt.WILL;
  var WONT = e.jmud.telopt.WONT;
  
  if (e.option != MXP) return;
  
  if (e.action == WILL) {
    e.jmud.mxp.enabled = true;
    e.jmud.sendIAC(IAC + DO + MXP);
  } else if (e.action == WONT) {
    e.jmud.mxp.enabled = false;
  }
  e.preventDefault();
}

/* Default Tags */
jMUDMXP.prototype.tags = {
  'VAR'       : {
    'default'   : true,
    'secure'    : true,
    'want'      : true,
    'open_tag'  : '',
    'close_tag' : '',
    'arg_order' : ['name','desc','private','publish','delete','add','remove'],
    'arguments' : {
      'name'    : '',
      'desc'    : '',
      'private' : false,
      'publish' : true,
      'delete'  : false,
      'add'     : true,
      'remove'  : false
    },
    'handler'    : function(jmud, tag, content, args, caught) { jmud.setVariable(args.name, args.text); }
  },
  'B'         : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<b class="mxp">',
    'close_tag' : '</b>'
  },
  'BOLD'      : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<b class="mxp">',
    'close_tag' : '</b>'
  },
  'STRONG'    : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<b class="mxp">',
    'close_tag' : '</b>'
  },
  'I'         : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<i class="mxp">',
    'close_tag' : '</i>'
  },
  'ITALIC'  : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<i class="mxp">',
    'close_tag' : '</i>'
  },
  'EM'        : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<i class="mxp">',
    'close_tag' : '</i>'
  },
  'U'         : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<u class="mxp">',
    'close_tag' : '</u>'
  },
  'UNDERLINE' : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<u class="mxp">',
    'close_tag' : '</u>'
  },
  'S'         : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<s class="mxp">',
    'close_tag' : '</s>'
  },
  'STRIKEOUT' : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<s class="mxp">',
    'close_tag' : '</s>'
  },
  'C'         : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'reprocess' : true,
    'open_tag'  : '<COLOR fore="&fore;" back="&back;">',
    'close_tag' : '</COLOR>',
    'arg_order' : ['fore','back'],
    'arguments' : {
      'fore'    : '#C0C0C0',
      'back'    : 'transparent'
    }
  },
  'COLOR'       : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '</span><span class="mxp mxp-color" style="color:&fore;;background-color:&back;;">',
    'close_tag' : '</span><span class="&defforeclass; &defbackclass;">',
    'arg_order' : ['fore','back'],
    'arguments' : {
      'fore'    : '#C0C0C0',
      'back'    : 'transparent'
    }
  },
  'H'         : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'reprocess' : true,
    'open_tag'  : '<HIGH>',
    'close_tag' : '</HIGH>'
  },
  'HIGH'      : {
    'default'   : true,
    'secure'    : false,
    'want'      : true,
    'open_tag'  : '',
    'close_tag' : '',
    'handler'   : function(jmud, tag, content, args, caught) {
      if (!jmud.c_bright) {
        jmud.c_bright = true;
        var out = jmud.outColor(true,true) + caught
        jmud.c_bright = false;
        return out + jmud.outColor(true,true);
      }
    }
  },
  'FONT'      : {
    'default'   : true,
    'secure'    : false,
    'want'      : false,
    'open_tag'  : '<font class="mxp" style="font-family:&face;; font-size:&size;; color:&color;; background-color:&back;;">',
    'close_tag' : '</font>',
    'arg_order' : ['face','size','color','back'],
    'arguments' : {
      'face'    : '"Courier New",monospace',
      'size'    : '12',
      'color'   : 'inherit',
      'back'    : 'inherit'
    }
  },
  'BR'        : {
    'default'   : true,
    'secure'    : true,
    'no_close'  : true,
    'want'      : false,
    'open_tag'  : '<br class="mxp" />'
  },
  'A'         : {
    'default'   : true,
    'secure'    : true,
    'want'      : true,
    'open_tag'  : '<a class="mxp mxp-external mxp-expire-&expire;" href="&href;" title="&hint;" target="_blank">',
    'close_tag' : '</a>',
    'arg_order' : ['href','hint','expire'],
    'arguments' : {
      'href'    : '&text;',
      'hint'    : 'URL: &href;',
      'expire'  : ''
    }
  },
  'SEND'      : {
    'default'   : true,
    'secure'    : true,
    'want'      : true,
    'open_tag'  : '<a class="mxp mxp-internal mxp-expire-&expire; &prompt:mxp-prompt;" href="&href;" name="&hint;" title="&hintone;">',
    'close_tag' : '</a>',
    'arg_order' : ['href','hint','prompt','expire'],
    'arguments' : {
      'href'    : '&text;',
      'hint'    : '',
      'prompt'  : false,
      'expire'  : ''
    }
  },
  'EXPIRE'    : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'no_close'  : true,
    'open_tag'  : '',
    'close_tag' : '',
    'arg_order' : ['name'],
    'arguments' : {
      'name'    : ''
    },
    'handler'   : function(jmud, tag, content, args, caught) {
      jmud.mxp.expire(args.name);
    }
  },
  'VERSION'   : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '',
    'close_tag' : '',
    'no_close'  : true,
    'arg_order' : [],
    'arguments' : {},
    'handler'   : function(jmud, tag, content, args, caught) {
      jmud.send('\x1b[1z<VERSION MXP=1.0 STYLE=1 CLIENT=jmud VERSION='+jmud.version+' REGISTERED=yes>',true,true);
    }
  },
  'H1'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<H1 class="mxp">',
    'close_tag' : '</H1>'
  },
  'H2'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<H2 class="mxp">',
    'close_tag' : '</H2>'
  },
  'H3'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<H3 class="mxp">',
    'close_tag' : '</H3>'
  },
  'H4'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<H4 class="mxp">',
    'close_tag' : '</H4>'
  },
  'H5'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<H5 class="mxp">',
    'close_tag' : '</H5>'
  },
  'H6'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<H6 class="mxp">',
    'close_tag' : '</H6>'
  },
  'HR'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'no_close'  : true,
    'open_tag'  : '<hr class="mxp" />',
    'close_tag' : ''
  },
  'SMALL'     : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<small class="mxp">',
    'close_tag' : '</small>'
  },
  'TT'        : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'open_tag'  : '<pre class="mxp">',
    'close_tag' : '</pre>'
  },
  'IMAGE'   : {
    'default'   : true,
    'secure'    : true,
    'want'      : false,
    'no_close'  : true,
    'arg_order' : ['fname','url','type','height','width','hspace','vspace','align','ismap','t','h','w'],
    'arguments' : {
      'fname'   : '',
      'url'     : '',
      'type'    : '',
      'height'  : '',
      'width'   : '',
      'hspace'  : '',
      'vspace'  : '',
      'align'   : '',
      'ismap'   : false
    },
    'open_tag'  : '<img class="mxp" src="&fname;" alt="&url;" />',
    'handler'   : function(jmud, tag, content, args, caught) {
      if (args.t !== undefined && args.t != '' && args.type == '') args.type = args.t;
      if (args.h !== undefined && args.h != '' && args.height == '') args.height = args.h;
      if (args.w !== undefined && args.w != '' && args.width == '') args.width = args.w;
      
      var out = '<img class="mxp';
      if (args.ismap == true) out += ' mxp-image-map';
      if (args.type != '') out += ' mxp-image-type-' + args.type;
      if (args.align == 'left') out += ' mxp-image-left';
      if (args.align == 'right') out += ' mxp-image-right';
      out += '" src="' + args.url + args.type + args.fname + '" ';
      
      if (args.height != '') out += 'height="'+args.height+'" ';
      if (args.width != '') out += 'width="'+args.width+'" ';
      
      if (args.hspace != '' || args.vspace != '' || (args.align != '' && args.align != 'left' && args.align != 'right')) {
        out += 'style="';
        if (args.hspace != '' && args.vspace != '') out += 'margin:' + args.vspace + 'px ' + args.hspace + 'px;';
        if (args.align == 'top') out += 'vertical-align:top;';
        if (args.align == 'middle') out += 'vertical-align:middle;';
        if (args.align == 'bottom') out += 'vertical-align:bottom;';
        out += '" ';
      }
      
      return out + '/>';
    }
  }
};

// And now, the magic. Hook it into jMUD
jMUD.prototype.available_plugins['mxp'] = jMUDMXP;