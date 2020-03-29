<HTML>
<HEAD>
<TITLE>Java Play Now - <?php echo $first_mnm; ?></TITLE>
</HEAD>
<BODY BGCOLOR=BLACK TEXT=WHITE>
<P>
Enjoy your stay!
<P>
<HR>
<?php
  include('config.php');
?>

<APPLET ARCHIVE="MagicApplet.jar" CODE="MagicApplet.class" WIDTH=1 HEIGHT=1>
 <PARAM NAME="FIRST_MNM" VALUE="<?php echo $first_mnm; ?>">
 <PARAM NAME="BANN__URL" VALUE="<?php echo $bann__url; ?>">
 <PARAM NAME="BANN_TIME" VALUE="<?php echo $bann_time; ?>">
 <PARAM NAME="BANN_BACK" VALUE="<?php echo $bann_back; ?>">
 <PARAM NAME="BANN_WDTH" VALUE="<?php echo $bann_wdth; ?>">
 <PARAM NAME="BANN_HGHT" VALUE="<?php echo $bann_hght; ?>">
 <PARAM NAME="BANN_DLIM" VALUE="<?php echo $bann_dlim; ?>">
 <PARAM NAME="TOPL_DLIM" VALUE="<?php echo $topl_dlim; ?>">
 <PARAM NAME="TOP_L_URL" VALUE="<?php echo $top_l_url; ?>">
 <PARAM NAME="FULL_DLIM" VALUE="<?php echo $full_dlim; ?>">
 <PARAM NAME="FUL_L_URL" VALUE="<?php echo $ful_l_url; ?>">
 <PARAM NAME="BUFF_SIZE" VALUE="<?php echo $buff_size; ?>">
 <PARAM NAME="FONT_SIZE" VALUE="<?php echo $font_size; ?>">
 <PARAM NAME="MAIN_BACK" VALUE="<?php echo $main_back; ?>">
 <PARAM NAME="MAIN_FORE" VALUE="<?php echo $main_fore; ?>">
 <PARAM NAME="TEXT_BACK" VALUE="<?php echo $text_back; ?>">
 <PARAM NAME="TEXT_FORE" VALUE="<?php echo $text_fore; ?>">
 <PARAM NAME="APPL_BACK" VALUE="<?php echo $appl_back; ?>">
 <PARAM NAME="ANSI_BEEP" VALUE="<?php echo $ansi_beep; ?>">
 <PARAM NAME="CLOSE_O_D" VALUE="<?php echo $close_o_d; ?>">
 <PARAM NAME="CR_S_CRLF" VALUE="<?php echo $cr_s_crlf; ?>">
 <PARAM NAME="LF_T_CRLF" VALUE="<?php echo $lf_t_crlf; ?>">
 <PARAM NAME="DOWNL_TXT" VALUE="<?php echo $downl_txt; ?>">
 <PARAM NAME="DOWNL_URL" VALUE="<?php echo $downl_url; ?>">
 <PARAM NAME="BANNR_TXT" VALUE="<?php echo $bannr_txt; ?>">
 <PARAM NAME="BANNR_URL" VALUE="<?php echo $bannr_url; ?>">
 <PARAM NAME="FEATR_TXT" VALUE="<?php echo $featr_txt; ?>">
 <PARAM NAME="FEATR_URL" VALUE="<?php echo $featr_url; ?>">
 <PARAM NAME="FIRST_PRT" VALUE="<?php echo $game_port; ?>">
 <PARAM NAME="FIRST_HST" VALUE="<?php echo $game_host; ?>">
 <PARAM NAME="LOCAL_HST" VALUE="<?php echo $game_host; ?>">
 <PARAM NAME="PROXY_PRT" VALUE="<?php echo $proxy_prt; ?>">
</APPLET>
<br>
<center>
<a href='http://www.mudmagic.com/'>
	<img src="powered.gif" alt='Powered By MudMagic' title='Powered By Mudmagic' border=0></a>
<br>
<a href="http://www.mudmagic.com/">Mud Magic</a><br>
</center>

You need a <a href='http://java.sun.com/j2se/1.4.2/download.html'>Java-enabled Web Browser</A> in order to connect.
</BODY>
</HTML>
