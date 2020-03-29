<?php
/*
Plugin Name: UnGallery
Plugin URI: http://markpreynolds.com/technology/wordpress-ungallery
Author: Mark Reynolds
Version: 1.1.5
Description: Publish directories of images as a browsable WordPress gallery.
*/

//	Set the version as above and pass to administration menu
$version_val = "1.1.5";
update_option( "version", $version_val );

include("configuration_menu.php");
$gallery = get_option( 'gallery' );

function ungallery() {

	//	Load the configuration data from the database
	$gallery = get_option( 'gallery' );
	$version = get_option( 'version' );
	$pic_root = get_option( 'images_path' );
	$hidden = get_option( 'hidden' );
	$columns = get_option( 'columns' );
	$marquee = get_option( 'marquee' );
	$marquee_size = get_option( 'marquee_size' );
	$thumbW = get_option( 'thumbnail' );
	$srcW = get_option( 'browse_view' );
	$movie_height = get_option( 'movie_height' );
	$movie_width = get_option( 'movie_width' );
	
	//	Provide the version of UnGallery
	print "<!-- UnGallery version: ". $version ." -->";

	$w = $thumbW;
	$blogURI = get_bloginfo('url') . "/";	
	$dir = "wp-content/plugins/ungallery/";
	$gallerylink = $_GET['gallerylink'];
	$src = $_GET['src'];
	$movie_types = array();

	//	If we are browsing a gallery, gallerylink is not set so derive it from src in URL
	if (isset($src)) {
		$lastslash =  strrpos($src, "/");	
		$gallerylink = substr($src, strlen($pic_root));		// 	Trim the path off root and above
		$length = strrpos($gallerylink, "/"); 		// 	Find length of gallery in string
		$gallerylink = substr($gallerylink, 0, $length);	// 	Trim the filename off the end
	}

	if ($gallerylink == "") {
		$gallerylink =  "";
	} else {   	//  If ?gallerylink is set and not "" then....
	
		//  Build the full gallery path into an array
		$gallerylinkarray =  explode("/", $gallerylink);
	
		//  Render the Up/Current directory links
		print '<a href="./'. $gallery .'">Top</a>';
		foreach ($gallerylinkarray as $key => $level) {
			$parentpath = $parentpath . $level ;
			print ' / <a href="'. $gallery .'?gallerylink='. $parentpath .'" >'. $level .'</a>';
			$parentpath = $parentpath . "/";
		}
	}

										// Create the arrays with the dir's media files
	$dp = opendir( $pic_root.$gallerylink);
	while ($filename = readdir($dp)) {
		if (!is_dir($pic_root.$gallerylink. "/". $filename))  {  // If it's a file, begin
				$pic_types = array("JPG", "jpg", "GIF", "gif", "PNG", "png"); 		
				if (in_array(substr($filename, -3), $pic_types)) $pic_array[] = $filename;		// If it's a picture, add it to thumb array
				else {
					$movie_types = array("MP4", "mp4");								
					if (in_array(substr($filename, -3), $movie_types)) $movie_array[$filename] = size_readable(filesize($pic_root.$gallerylink. "/". $filename));		// If it's a movie, add name and size to the movie array
				}
		}
	} 
	// If we are viewing a gallery, arrange the thumbs
	if($pic_array) sort($pic_array);	
	// Unless we are at the top level and marquee is set, display the zip link
	if ($_SERVER["REQUEST_URI"]  !== "/".$gallery) print '  / <a href="'. $blogURI . $gallery .'?zip=' . $gallerylink . '" title="Download a zipped archive of all photos in this gallery">-zip-</a> /';	
	elseif ($marquee !== "yes") print '  / <a href="'. $blogURI . $gallery .'?zip=' . $gallerylink . '" title="Download a zipped archive of all photos in this gallery">-zip-</a> /';	

	// Display the movie links
	if($movie_array) {					
		print ' <br>Movies:&nbsp;&nbsp;';
		foreach ($movie_array as $filename => $filesize) {
			print  '
				<a href="'. $gallery .'?src='. $pic_root . substr($parentpath, 0, strlen($parentpath) -1).$subdir.'/'.$filename. '" title="This movie file size is '. $filesize .'">'	.$filename.'</a>&nbsp;&nbsp;/&nbsp;&nbsp;';
		}
	}
	closedir($dp);
	print '&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;Sub Galleries&nbsp;:&nbsp;&nbsp;';
	$dp = opendir($pic_root.$gallerylink);	//  Display the Subdirectory links
	while ($subdir = readdir($dp)) {		//  If it is a subdir and not set as hidden, enter it into the array
		if (is_dir($pic_root.$gallerylink. "/". $subdir) && $subdir !="thumb_cache" && $subdir != "." && $subdir != ".." && !strstr($subdir, $hidden)) {
			$subdirs[] = $subdir;
		}
	}

	if($subdirs) {							//  List each subdir and link
		sort($subdirs);	
		foreach ($subdirs as $key => $subdir) {
			print  '<a href="'. $gallery .'?gallerylink='. $parentpath.$subdir. '" >'	.$subdir.'</a> / ';
		}
	}
	closedir($dp);
	print '
	<table width="100%"><tr>';			//	Begin the table
	if (!isset($src) && isset($pic_array)) {							//	If we are not in browse view,
		if ($marquee == "yes" && $gallerylink == "") $w = $marquee_size	;			//	Set size of marquee picture
			else $w = $thumbW;
		print '<div class="post-headline"><h2>'; 
		if (file_exists($pic_root.$gallerylink."/banner.txt")) {
			include ($pic_root.$gallerylink."/banner.txt");					//	We also display the caption from banner.txt
		} else {
			$lastslash =  strrpos($gallerylink, "/");
			if (strpos($gallerylink, "/")) print substr($gallerylink, $lastslash + 1);
			else print $gallerylink;
		}
		print "</h2></td></tr><tr>";									//	Close cell. Add a bit of space
		$column = 0;
		print '<td>';
		foreach ($pic_array as $filename) {								//  Use the pic_array to assign the links and img src
			print '<a href="?src='. $pic_root . $gallerylink. "/" .$filename.'"><img src="'. $blogURI . $dir . 'phpthumb/phpThumb.php?ar=x&src='. $pic_root . $gallerylink. "/". $filename.'&w=' .$w. '"></a>'; 
			$column++;
			if ( $column == $columns ) {
				print '<br>';
				$column = 0;
			}
		}
	} else {														//  Render the browsing version, link to original, last/next picture, and link to parent gallery
	if (isset($src) && !in_array(substr($src, -3), $movie_types)) { //  If we are in broswing mode and the source is not a movie
		$filename = substr($src, $lastslash + 1);
		$before_filename = $pic_array[array_search($filename, $pic_array) - 1 ];
		$after_filename = $pic_array[array_search($filename, $pic_array) + 1 ];
																	//  Display the current/websize pic
		print '
		<td rowspan="2" style="vertical-align:middle;"><a href="'. $blogURI . $dir .'source.php?pic=' . $src . '"><img src="'. $blogURI . $dir . 'phpthumb/phpThumb.php?ar=x&src='. $src. '&w='. $srcW. '"></a></td>
		<td valign="center">';
			
		if ($before_filename) {										// Display the before thumb, if it exists
			print '<a href="?src='. $pic_root . $gallerylink."/".$before_filename .'" title="Previous Gallery Picture"><img src="'. $blogURI . $dir .'phpthumb/phpThumb.php?ar=x&src='. $pic_root . $gallerylink."/".$before_filename .'&w='. $w .'"></a>';
		}
	print "</td>
	</tr>
	<tr>
	<td>
	";
		if ($after_filename) {										// Display the after thumb, if it exists
			print '	<a href="?src='. $pic_root . $gallerylink."/".$after_filename .'" title="Next Gallery Picture"><img src="'. $blogURI . $dir .'phpthumb/phpThumb.php?ar=x&src='. $pic_root . $gallerylink."/".$after_filename .'&w='. $w .'"></a>';
		}
	} elseif (($movie_array) && (in_array(substr($src, -3), $movie_types))) print '<td>
<OBJECT CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" CODEBASE="http://www.apple.com/qtactivex/qtplugin.cab" width="'. $movie_width .'" height="'. $movie_height .'" ><br />
<PARAM NAME="src" VALUE="wp-content/plugins/ungallery/source.php?movie='. $src  .'" ><br />
<PARAM NAME="controller" VALUE="true" ><br />
<EMBED SRC="wp-content/plugins/ungallery/source.php?movie='. $src  .'" TYPE="image/x-macpaint" PLUGINSPAGE="http://www.apple.com/quicktime/download" AUTOPLAY="true" width="'. $movie_width .'" height="'. $movie_height .'" ><br />
</EMBED><br />
</OBJECT>';															// If the source is a movie, play it
	else print "<br><br>"; 
	}
	print "
	</td>
	</tr>
	</table>";
}
function size_readable ($size, $retstring = null) {
        // adapted from code at http://aidanlister.com/repos/v/function.size_readable.php
        $sizes = array('B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
        if ($retstring === null) { $retstring = '%01.2f %s'; }
        $lastsizestring = end($sizes);
        foreach ($sizes as $sizestring) {
                if ($size < 1024) { break; }
                if ($sizestring != $lastsizestring) { $size /= 1024; }
        }
        if ($sizestring == $sizes[0]) { $retstring = '%01d %s'; } // Bytes aren't normally fractional
        return sprintf($retstring, $size, $sizestring);
}

function zip() {
	$blogURI = get_bloginfo('url') . "/";	
	include ("zip.php");
}

function hidden() {
	include ("hidden.php");
}

if (strpos($_SERVER["REQUEST_URI"], $gallery ."?zip")) {				// If the zip flag is active, display the archive information page and links
	add_filter('the_content', "zip");
}	elseif (strpos($_SERVER["REQUEST_URI"], $gallery . "?hidden")) {		// If the hidden flag is active, display the hidden links page
	add_filter('the_content', "hidden");	
}	elseif (strstr($_SERVER["REQUEST_URI"], "/". $gallery)) {				// Otherwise display the main gallery
	add_filter('the_content', "ungallery");
}

?>