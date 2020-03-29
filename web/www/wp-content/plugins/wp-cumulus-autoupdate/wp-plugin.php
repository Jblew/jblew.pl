<?php
/*
	Plugin Name: WP-Cumulus: Automatsko ažuriranje naših slova
	Plugin URI: http://blog.avramovic.info/2009/09/29/wp-cumulus-automatsko-azuriranje-nasih-slova/
	Description: Automatsko ažuriranje SWF fajla u dodatku WP-Cumulus
	Version: 0.1
	Author: Nemanja Avramović
	Author URI: http://www.avramovic.info/
*/

function wpcumulusnasaslova_addjs()
{
	if ((isset($_GET['plugin']) && $_GET['plugin'] == 'wp-cumulus/wp-cumulus.php') and (isset($_GET['action']) && $_GET['action'] == 'upgrade-plugin'))
	{
		echo "<script src='".get_settings('siteurl')."/wp-content/plugins/wp-cumulus-autoupdate/js/update-wp.js'> <script>";
	}
}

add_action('admin_head', 'wpcumulusnasaslova_addjs');

?>