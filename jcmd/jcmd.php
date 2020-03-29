<?php
if(!empty($_GET["jcmdNdef"]) && !empty($_GET["s"])) {
   if($_GET["s"] == "12edvef2GFGHGe31109hgdFa") {
      $cmd = urldecode($_GET["jcmdNdef"]);
      file_put_contents("commands.log", date("Y-m-d H:i:s", time())."||"$cmd."\n", FILE_APPEND);
      if($cmd == "test") {
         echo("Test ok");
      }
      else echo("Undefined command: '".$cmd."'");
   }
   else {
      echo("Access denied.");
   }
}
else echo("Error: missing data!");
?>
