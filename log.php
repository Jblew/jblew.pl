<?php
function sendmessage($msg) {
	$srvs = array("http://jblew.bimbrownia.org/index.php?log=");
	foreach($srvs as $srv) {
		$rsp = "";
		if(!($rsp = @file_get_contents($srv.str_replace(" ", "+", $msg)))) {
			zlog("Error connecting to server ".$srv."\n", false);
		}
		else {
			if($rsp != "o" && $rsp != "b") zlog("Error connecting to server ".$srv.": $rsp\n", false);		
		}
	}
}
function zlog($msg, $smes) {
	$lines = file("../log.txt");
        $bylo = false;
        foreach($lines as $sline) {
                $line = explode("] ", $sline);
                if($line[1] == $msg."\n") die("b");
                //else echo($sline.": ".$line[1]."\n");
        }
        $file = fopen("../log.txt", "a+");
        fwrite($file, "[".date("D, d.m.Y H:i:s; P")."] ".base64_decode($msg)."\n");
        fclose($file);
	if($smes) {
		//sendmessage($msg);
	        echo("o");
	}
}
if(isset($_GET['log'])) {
        zlog(strip_tags(addslashes($_GET['log'])), true);
}
else echo("<h1>VLog</h1>");
?>
