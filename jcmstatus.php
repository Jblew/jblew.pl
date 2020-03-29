<?php
//STAT: 1=ok
$s1 = serialize(array("stat" => 1, "msg" => "Ok. Serwer sprawny."));
echo($s1."<br />");
$s2 = base64_encode($s1);
echo($s2."<br />");
$firstarr = preg_split('//', $s2, -1, PREG_SPLIT_NO_EMPTY);
function arrcmb(&$item1, $key)
{
    $item1 = 2962-ord($item1);
}

array_walk($firstarr, 'arrcmb');
print_r($firstarr);
$outs = base64_encode(urlencode(base64_decode(serialize($firstarr))));
echo($outs."<br />\n");
echo("DecS2: ".base64_decode($s2));
?>
