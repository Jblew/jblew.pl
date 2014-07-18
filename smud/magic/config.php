<?php
/***************************************************************************
 *  Mud Magic Java Mud Client                                              *
 *  Copyright (C) 2004 MudMagic.Com ( hosting@mudmagic.com )               *
 *                2004 Calvin Ellis ( kyndig@mudmagic.com  )               *
 *                                                                         *
 ***************************************************************************/
/***************************************************************************
 *                                                                         *
 *   This program is free software to use for the connection of online     *
 *   text games. Redistribution of this product is prohibited without the  *
 *   permission of MudMagic.Com in writing. This software is released in   *
 *   the hopes that it will be helpful to webmasters whom are looking to   *
 *   let their players connect to their games. There are no monetary or    *
 *   obligations which come with this software. Use it as you would see    *
 *   fit. If you find it usefull, we ask that you leave the POWERED BY     *
 *   MUDMAGIC icon and link on the website page, or place a link somewhere *
 *   on your website to http://www.mudmagic.com/ ( this is not a           *
 *   requirement though )                                                  *
 ***************************************************************************/

/* This client will connect to any local mud, if the client is
 * running on that same server. There is a proxy available which
 * will allow the client to connect to any mud in the Top Mud List,
 * and Full Mud List. The proxy must be installed and started in
 * order to connect to remote locations. All MudMagic.Com servers
 * have the MudMagic Proxy already installed, and will connect to
 * other muds with default setting. The MudMagic proxy need only be
 * operating in one instance on the server to supply proxy support for
 * this client to all websites on that server.
 * For more details on proxy visit mudmagic.com java client area 
 * or view your documentation
 */

#########################################################
# BASE SETTINGS: The following variables need to be     #
# set in order for this client to work on your website. #
# You can let the remainder values default              #
#########################################################

## first_mnm: any valid string, specifing the name of the mud 
$first_mnm  = "Dungeon Runners";

## client_url: any valid url, specifing the directory location of installed client (leave off any trailing /)
$client_url = "http://www.mudmagic.com/telnet";

## game_host: any valid host name, specifing the host name of your mud ("localhost" not allowed) 
$game_host  = "mudmagic.com";

## game_port: any valid integer, specifing the port your mud is operating on
$game_port  = 9000;

## proxy_port: any valid integer, specifing the port you are running MudMagic proxy on. It is
##             safe to let this default if you are not running a proxy. In this case, the client
##             will only connect to a local running mud.
$proxy_prt  = 23;

##################################################################
# End of Base Settings.						 #
# BANNER SETTINGS						 #
# You can use our default banner engine, or run your own         #
# banner system. In order to run your own banner system, a       #
# file must be created with proper output, and the banner images #
# have to be local on the same website                           #
##################################################################

## BANN__URL : any valid URL specifing the location of a valid banner data file. Must be local
$bann__url   = $client_url."/bannerlist.php";

## BANN_TIME : any integer, specifing the time to rotate the banners in seconds.
$bann_time = 15;

## BANN_BACK: any valid string color, specifing the banner area background color
$bann_back   = "Black";

## BANN_WDTH : any integer, specifing the initial width of the banner area,this value also sets the client
##	       startup width size
$bann_wdth   = 600;

## BANN_HGHT : any integer, specifing the initial height of the banner area, this value also sets the client
##	       startup height size
$bann_hght   = 100;

## BANN_DLIM : any value, specifing the delimeter string used to parse the banner data
$bann_dlim   = "#";

##################################################################
# End of Banner Settings.                                        #
# MUD LIST SETTINGS                                              #
# You can use our default top mud list, and full mud list that   #
# will work with this client out of the box. You can also use    #
# your own mud lists. Simply create a file with the proper format#
# and set the top_l_url and appropiate values. Review the        #
# documentation for more details                                 #
##################################################################

## TOPL_DLIM : any string, specifing the delimiter string used to parse the 'Top Mud List'
$topl_dlim   = "#~#";

## FULL_DLIM : any string specifing the delimeter string used to parse the 'Full Mud List'
$full_dlim   = "#";

## TOP_L_URL : any valid URL, specifing the location of a valid 'Top Mud List' must be local
$top_l_url   = $client_url."/toplist.php";

## FUL_L_URL : any valid URL, specifing the location of a valid 'Full Mud List', must be local
$ful_l_url  = $client_url."/fulllist.php";

##################################################################
# End of Mud List Settings.                                      #
# APPLET SETTINGS						 #
# Just about everything in the applet is customisable, from the  #
# colors used, to the links in the pulldown ABOUT menu           #
##################################################################

## BUFF_SIZE: any accepted integer ( from the set of: 100,200,250,500,1000,2000 ) to specify the
##            initial buffer size, in lines of the main text area.
$buff_size = 500;

## FONT_SIZE: any accepted integer( from the set: 8, 9, 10, 11, 12, 14, 16), to specify the
##            font size of the main text area
$font_size = 12;

## MAIN_BACK: any accepted color string ( from the set: Black, Red, Green, Yellow, Blue, Magenta, Cyan
##            Light Gray, Dark Red, Dark Green, Dark Yellow, Dark Blue, Dark Magenta, Dark Cyan, White ) to
##            specify the initial background color of the main text area.
$main_back = "Black";

## MAIN_FORE: any accepted color string ( from the set: Black, Red, Green, Yellow, Blue, Magenta, Cyan
##            Light Gray, Dark Red, Dark Green, Dark Yellow, Dark Blue, Dark Magenta, Dark Cyan, White ) to
##            specify the initial foreground color of the main text area.
$main_fore = "Green";

## TEXT_BACK: any accepted color string ( from the set: Black, Red, Green, Yellow, Blue, Magenta, Cyan
##            Light Gray, Dark Red, Dark Green, Dark Yellow, Dark Blue, Dark Magenta, Dark Cyan, White ) to
##            specify the initial background color of the typing bar.
$text_back = "Black";

## TEXT_FORE: any accepted color string ( from the set: Black, Red, Green, Yellow, Blue, Magenta, Cyan
##            Light Gray, Dark Red, Dark Green, Dark Yellow, Dark Blue, Dark Magenta, Dark Cyan, White ) to
##            specify the initial foreground color of the typing bar.
$text_fore = "White";

## APPL_BACK: any accepted color string ( from the set: Black, Red, Green, Yellow, Blue, Magenta, Cyan
##            Light Gray, Dark Red, Dark Green, Dark Yellow, Dark Blue, Dark Magenta, Dark Cyan, White ) to
##            specify the applet area color in the html page.
$appl_back = "Magenta";

## ANSI_BEEP: any string of value: "true","yes","1", or "false","no","0" to allow beeps
$ansi_beep = "true";

## CLOSE_O_D: any string of value: "true","yes","1", or "false","no","0" to close the client on disconnect
$close_o_d = "false";

## CR_S_CRLF: any string of value: "true","yes","1", or "false","no","0" to specify "CR sends CR/LF"
$cr_s_crlf = 1;

## LF_T_CRLF: any string of value: "true","yes","1", or "false","no","0" to specify "LF to Cr/Lf"
$lf_t_crlf = 1;

## DOWNL_TXT: any string value. This value will be put under "Visit MudMagic.com !" under the About
##	      menu.
$downl_txt = "Download Client";

## DOWNL_URL: any valid URL. This URL will be shown when the user will click the above described menu 
##            item. 
$downl_url = "http://www.mudmagic.com/java-client/";

## BANNR_TXT: any string value. This value will be put under the above one under the About menu. 
$bannr_txt = "Banner adds";

## BANNR_URL: any valid URL. This URL will be shown when the user will click the above described menu item.
$bannr_url = "http://www.mudmagic.com/banners";

## FEATR_TXT: any string value. This value will be put under the above one under the About menu. 
$featr_txt = "Godwars II";

## FEATR_URL: any valid URL. This URL will be shown when the user will click the above described menu item.
$featr_url = "http://www.godwars2.com";
?>
