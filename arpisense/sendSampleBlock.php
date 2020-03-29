<?php
if(!empty($_POST['len'])) {
  $len = $_POST['len'];
  
  echo("OK, len=".$len."\n");
  
  $data = array();
  $data['entropy'] = array();
  
  for($i = 0;$i < $len;$i++) {
    if(!empty($_POST['entropy'.$i])) {
      $data['entropy'][$i] = $_POST['entropy'.$i];
    }
    else echo("Missing sample ".$i."\n");
  }
  
  file_put_contents(time().".smp", json_encode($data));
}
else {
  echo("ERR_NO_DATA\n");
}
?>
