=== Plugin Name ===
Contributors: Avram
Donate link: http://www.avramovic.info/lang/en-us/donate
Tags: wp-cumulus, tagcloud, tags, Serbian, Serbia, utf-8
Requires at least: 2.5
Tested up to: 2.8.4
Stable tag: trunk

This plugin automatically re-downloads tagcloud.swf with Serbian alphabet letters.

== Description ==

This plugin attaches itself to upgrade process of WP-Cumulus plugin, so every time you update WP-Cumulus it will automatically re-download `tagcloud.swf` with Serbian latin and cyrillic letters, so you don't have to worry about them being lost with each update of WP-Cumulus.

Only for ex-Yugoslavian bloggers ;)

== Installation ==

*First, CHMOD file `wp-content/plugins/wp-cumulus/tagcloud.swf` to 777*

Then, upload contents of zip archive to your `wp-content/plugins/` folder and activate plugin from WP admin area if you want it to run automatically.

Afterwards you can run the script manually by opening following URL in your web browser:
`http://www.yourwebsite.com/wp-content/plugins/wp-cumulus-autoupdate/`

Also, script is automatically executed each time you update WP-Cumulus plugin (if plugin is activated).

== Frequently Asked Questions ==

= Isn't it stupid to make plugin for another plugin? =

It might be, but this is very light and unobtrusive plugin which runs even if not activated (but if you want it to automatically runs each time you update WP-Cumulus you should activate it).

== Screenshots ==

1. Automatic update of SWF file
2. Manual update of SWF file

== Changelog ==

= 0.1 =
* initial release