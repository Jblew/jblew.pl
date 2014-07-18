=== UnGallery ===
Contributors: mmond
Tags: gallery, ungallery, pictures, movies, mp4, jpg, png, galleries, photos, browse, images
Requires at least: 
Tested up to: 3.0.3
Stable tag: trunk

Publish external image directories in WordPress.  

== Description ==

UnGallery displays directories of images as a browsable WordPress gallery. 

The advantage of UnGallery is there is there is no gallery management required in WordPress.  You just point the plugin to a directory of photos, even thousands of them organized into subdirectories, and they are immediately viewable via an existing WordPress site.  Any uploads, deletions, or edits you make to your photos and directories are automatically reflected in WordPress.

If you've ever had to reorganize galleries after publishing them, you know how inconvenient it is to return to a web tool to correct the paths, relink the thumbnails, updated titles, etc.   With UnGallery, you can restructure entire galleries, edit a dozen party pic red-eyes, rename an event or remove individual photos and each of these changes is automatically live in WordPress.

[Introduction and installation screencast](http://markpreynolds.com/technology/wordpress-ungallery)

Mark Reynolds http://markpreynolds.com

== Installation ==

1. Upload to ./wp-content/plugins/ and activate on the Plugins menu.
1. Enable Permalinks: Settings -> Permalinks -> Custom Structure -> /%category%/%postname%
1. Create a blank WordPress Page, for example: "Gallery".
1. Enter the path to your directory of images on the UnGallery administration menu under Settings / UnGallery. 

== Features ==

* Unlimited depth, breadth, and number of photos in library. My gallery has about 6,000 pictures and movies.
* Photos are managed outside of WordPress.  Simply update a picture directory and UnGallery sees changes immediately.
* Default and configurable gallery titles
* Galleries can be set to hidden.  These do not display in browsing, with access provided via direct link.
* Caching for faster page loads
* MP4 movies embedded and played within the WordPress site.
* Image rotation support for orientation of jpegs with exif data
* Gallery hierarchy breadcrumb links
* Multiple gallery views:  Top level marquee (optional), thumbnails, browsing previous and next pictures.

== Screenshots ==

1. The UnGallery top level view.  The highest level of the gallery can display a single larger, picture or a views of thumbnails as the subdirectories/subgalleries do.  This is configurable via the UnGallery administration page.
2. Selecting one of the subgallery links displays the thumbnail gallery view of all JPGs, PNGs and GIFs in the directory.  A breadcrumb trail back to the top level of the galleries is displayed along with the new subgalleries.  The -zip- link builds an archive of all images in the current directory for convenient download.
3. Clicking on a thumbnail displays the larger browsing view along with previous and next thumbnails.  There are movie files in this directory, so links to these are displayed also.  All UnGallery's published sizes are adjustable to fill larger page widths as this site uses.

== Changelog ==

= 0.9 =
* MP4's are now embedded and integrated into the WP site frame.  Support for older movie formats is deprecated.
* Current directory breadcrumb link added.  This allows returning to the thumbnail list from the web-size browse view.
* Compatibility for WP 3.0's default twentyten theme that broke UnGallery's browse view.
= 0.9.1 =
* Added hardening code and replaced relative links with absolute links
= 0.9.2 =
* Added top-level gallery logic to toggle marquee and zip display behavior
* Added support for custom WordPress and Site addresses
= 0.9.3 =
* Fixed issue with IE downloading zip archives of images
= 0.9.4 =
* Fixed issue with some browsers not playing mp4
* Fixed case sensitivity problem with .mp4/MP4
* Fixed erroneously reporting plugin download needed for directories with no image files.
= 0.9.5 =
* You no longer need to call the gallery: "gallery".  Any name can be used.
* Fixed issue with extra character in hidden.txt causing mismatch
= 0.9.6 =
* Versioning removed to disable automatic updates
= 0.9.9 =
* Due to WP plugin automatic updates deleting and replacing the plugin directory, your images (and any other valuable user data) should **not** be stored in the plugin directory
* Versioning readded, plugin updates reactivated
* WordPress Plugin menu screen replaces configuration files
= 1.0 =
* Administration menus auto-populate with default values when blank
* Instructions updated for new configuration
= 1.0.1 =
* Version format updated
* Hidden gallery field added to those auto-populated if blank
* Introduction and installation screencast 
= 1.0.2 =
* Version number is displayed on admin menu page and noted in html
= 1.0.3 =
* Consolidated thumbnail creation files in preparation to update that library
* Fixed a regression in zip file download
= 1.0.4 =
* First integrated support tips/tool added (pwd)
= 1.1.0 =
* Upgraded the thumbnail library to phpThumb which enables many new imaging options.
* Caching no longer writes to image directories. Cache dir is ./WordPress installation/wp-content/cache/ is created
= 1.1.1 =
* Oops.  Forgot to svn add the phpThumb script subdirectory.
* Also, some version number increments do not trigger automatic update and flag as recent on wp.org
= 1.1.2 =
* Admin menu file was incomplete, causing serious bug when not using gallery name: 'gallery'
= 1.1.3 =
* Changed the create cache directory code to use PHP function vs. exec php which is not allowed on some hosters
= 1.1.4 =
* phpThumb calls set_time_limit which is not supported in safe.  Disabled for now, potential conditional for later.
* Removed cache limits
= 1.1.5 =
* phpThumb is apparently no longer supported and so did not support php 5.3.  Others have extended the code though and this patch fixes UnGallery running on a php 5.3 server.

== Dependencies ==

* Linux on the WordPress server
* Permalinks enabled: Settings -> Permalinks -> Custom Structure -> /%category%/%postname% 

== Notes ==

* All image sizes including thumbnails, selected image view, movies, marquee, and column layout are customizable.
* To display a caption over a gallery, add a file named banner.txt to that directory with the desired text.  The file can include plain text or html. If no banner.txt is found, the name of the directory used.
* The top level directory can optionally be used for a larger, marquee picture displayed.  If chosen, load one picture file to the top level directory.  This can be enabled/disabled using the UnGallery administration page.
* To mark a gallery hidden, enter a name for hidden galleries on the UnGallery administration page. Any directories you create named "hidden", will not be visible via normal gallery browsing. A direct link may be sent to provide access to hidden galleries.  
* You can include UnGallery images in other areas of your WordPress site or other sites by embedding the URL from UnGallery into the external site.

== License ==

The MIT License

	
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


