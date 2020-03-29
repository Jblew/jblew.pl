<?php
//echo date("Y.m.d H:i:s", time());
//$sczas = time();
$plik = fopen("banner_counter.txt", "r+");
$ile = fread($plik, 1000000);
fclose($plik);
$plik = fopen("banner_counter.txt", "w+");
$iile = $ile+1;
fwrite($plik, $iile);
fclose($plik);
$plik2 = fopen("banner_log.txt", "a+");
$str = time()."||".date("Y.m.d H:i:s", time())."||".$_SERVER["REMOTE_ADDR"]."||".$_SERVER["REMOTE_PORT"]."||".$_SERVER["HTTP_USER_AGENT"]."\n";
fwrite($plik2, $str);
fclose($plik2);
$eczas = time();
//$iczas = $eczas-$sczas;
//echo($iczas);
$user_data = $_SERVER["QUERY_STRING"];

header("Content-Type: image/png");
echo(file_get_contents("banner.png"));
?>
