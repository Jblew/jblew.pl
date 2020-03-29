<?php
/*CONFIG*/
$maindir = "/homez.312/jblew/";
$server = "jblew";
$salt = "Dc1NGIWVmYj";
/*END CONFIG*/

function du($dir) 
{ 
    $res = `du -sk $dir`;             // Unix command
    preg_match( '/\d+/', $res, $KB ); // Parse result
    $MB = round( $KB[0] / 1024, 1 );  // From kilobytes to megabytes
    return $MB;
} 
if(!empty($_GET['pt'])) {
	$pt = addslashes($_GET['pt']);
	if($pt == $salt.base64_encode(md5(date("M")).md5("hbbkjfjfwjblf".round(time()/60)."hahaha74837493"))) {
		$adata = array("msg" => "welcome", "server" => $server);
		$adata["disk_used_space"] = du($maindir);
		$adata["cwd"] = getcwd();
		print_r($adata);
	}
	else die("OK");
}
else die("OK");
?>
