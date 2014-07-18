/* jSocket.as
 * 
 * jMUD Socket v0.6.2
 *
 * This is a version of jSocket modified by Stendec <stendec365@gmail.com> for
 * use with the jMUD JavaScript MUD client.
 *
 * The MIT License
 * 
 * Copyright (c) 2008 Tjeerd Jan 'Aidamina' van der Molen <aidamina@gmail.com>
 * http://jsocket.googlecode.com
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

package {
	import flash.display.Sprite;
	import flash.external.ExternalInterface;
	import flash.events.*;
	import flash.net.Socket;
	import flash.system.Security;
	import flash.utils.ByteArray;

	public class jSocket extends Sprite {
		protected var socket:Socket;
		protected var id:String;
		protected var bsreg:RegExp;
		protected var nbreg:RegExp;
		protected var nireg:RegExp;

		public function jSocket():void {
			// Pass exceptions between flash and browser
			ExternalInterface.marshallExceptions=true;

			bsreg = new RegExp("\\\\","g");
			nbreg=new RegExp("\\x00","g");
			nireg=new RegExp("\\x01\\x02NU\\x03LL\\x02\\x01","g");

			var url:String=root.loaderInfo.url;
			id=url.substring(url.lastIndexOf("?")+1);

			socket=new Socket  ;

			socket.addEventListener("close",onClose);
			socket.addEventListener("connect",onConnect);
			socket.addEventListener("ioError",onError);
			socket.addEventListener("securityError",onSecurityError);
			socket.addEventListener("socketData",onDataBytes);

			ExternalInterface.addCallback("loadpolicy",loadpolicy);
			ExternalInterface.addCallback("connect",connect);
			ExternalInterface.addCallback("close",close);
			ExternalInterface.addCallback("write",write);
			ExternalInterface.addCallback("send",writenp);
			ExternalInterface.addCallback("naws",naws);
			ExternalInterface.addCallback("sendnull",sendnull);

			ExternalInterface.call("jSocket.flashCallback","init",id);
		}

		public function loadpolicy(host:String,port:int):void {
			Security.loadPolicyFile("xmlsocket://"+host+":"+port);
		}

		public function connect(host:String,port:int):void {
			socket.connect(host,port);
		}

		public function close():void {
			socket.close();
		}

		public function sendnull():void {
			socket.writeByte(0);
		}

		public function write(msg:String):void {
			for (var i:int=0; i<msg.length; ++i) {
				socket.writeByte(msg.charCodeAt(i));
			}
			socket.flush();
		}

		public function writenp(msg:String):void {
			for (var i:int=0; i<msg.length; ++i) {
				socket.writeByte(msg.charCodeAt(i));
			}
		}

		public function naws(columns:int,rows:int):void {
			socket.writeByte(255);
			socket.writeByte(250);
			socket.writeByte(31);
			socket.writeShort(columns);
			socket.writeShort(rows);
			socket.writeByte(255);
			socket.writeByte(240);
			socket.flush();
		}

		protected function onConnect(event:Event):void {
			ExternalInterface.call("jSocket.flashCallback","connect",id);
		}

		protected function onError(event:IOErrorEvent):void {
			ExternalInterface.call("jSocket.flashCallback","error",id,event.text);
		}

		protected function onSecurityError(event:SecurityErrorEvent):void {
			ExternalInterface.call("jSocket.flashCallback","error",id,event.text);
		}

		protected function onClose(event:Event):void {
			socket.close();
			ExternalInterface.call("jSocket.flashCallback","close",id);
		}

		protected function onDataBytes(event:ProgressEvent):void {
			//var dat:ByteArray=new ByteArray  ;
			var s:String = "";
			var avail:int = socket.bytesAvailable;
			for (var i:int=0; i<avail; ++i) {
				s = s + String.fromCharCode(socket.readUnsignedByte())
			}
			s = s.replace(bsreg,"\\\\").replace(nbreg,"\x01\x02NU\x03LL\x02\x01");
			//var s:String = socket.readMultiByte(socket.bytesAvailable,"IBM437").replace(bsreg,"\\\\").replace(nbreg,"\x01\x02NU\x03LL\x02\x01");
			//socket.readBytes(dat,0,socket.bytesAvailable);
			//var s:String = dat.toString().replace(bsreg,"\\\\").replace(nbreg,"\x01\x02NU\x03LL\x02\x01");
			ExternalInterface.call("jSocket.flashCallback","data",id,s);
		}
	}
}