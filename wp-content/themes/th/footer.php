<div id="footer">
<p>&copy; Copyright 2009 and Designed by <a href="mailto:jblew@jblew.pl">JBLew</a>. Autor: <a href="mailto:jblew@jblew.pl">JBLew</a>&nbsp;&nbsp;|&nbsp;&nbsp;Strona używa <a target="_blank" href="http://pl.wordpress.org/">Wordpress-a</a>.&nbsp;&nbsp;|&nbsp;&nbsp;<a href="http://jblew.pl/wp-admin/">Panel administracyjny</a>
<?php
if (is_home()) {
        
}
 wp_footer();
?>
</p>

</div>
<?php
//echo date("Y.m.d H:i:s", time());
//$sczas = time();
$plik = fopen("counter.txt", "r+");
$ile = fread($plik, 1000000);
fclose($plik);
$plik = fopen("counter.txt", "w+");
$iile = $ile+1;
fwrite($plik, $iile);
fclose($plik);
$plik2 = fopen("users3.txt", "a+");
$str = time()."||".date("Y.m.d H:i:s", time())."||".$_SERVER["REQUEST_URI"]."||".$_SERVER["REMOTE_ADDR"]."||".$_SERVER["REMOTE_PORT"]."||".$_SERVER["HTTP_USER_AGENT"]."\n";
fwrite($plik2, $str);
fclose($plik2);
$eczas = time();
//$iczas = $eczas-$sczas;
//echo($iczas);
$user_data = $_SERVER["QUERY_STRING"];
?>
<!--<script src="http://www.jblew.ovh.org/fs1234567891/foreststatscode.php?usercode=1" type="text/javascript"></script>-->


<!-- Start of Woopra Code -->
<script type="text/javascript">
var woo_settings = {idle_timeout:'1800000', domain:'jblew.pl'};
(function(){
var wsc = document.createElement('script');
wsc.src = document.location.protocol+'//static.woopra.com/js/woopra.js';
wsc.type = 'text/javascript';
wsc.async = true;
var ssc = document.getElementsByTagName('script')[0];
ssc.parentNode.insertBefore(wsc, ssc);
})();
</script>
<!-- End of Woopra Code -->
<!--BODY-END-->
</body>
</html>
