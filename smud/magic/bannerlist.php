<?
/* This will retrieve the list of banners from mudmagic.com */
$this_host     = getenv("HTTP_HOST");
$path_parts    = pathinfo( $_SERVER["PHP_SELF"] );
$this_location = $path_parts["dirname"];

$full_location = "http://$this_host".$this_location."/bannerview.php?image=";

include("http://www.mudmagic.com/java-client/banner_remote.php?loc=$full_location");
?>
