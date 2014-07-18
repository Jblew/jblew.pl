Building the archive now.... <br>
<br>
A summary will print below when the zip file is ready.  Depending on the number of photos it may take a few minutes to complete.  Your browser may even time out before it's ready.  If so, just hit refresh and this page will reload with the summary and zip file link. <br><br>
<?
$gallery = get_option( 'gallery' );
$pic_root = get_option( 'images_path' );
$dir = $pic_root . $_GET['zip'];


// Create the arrays with the dir's image files
$dp = opendir($dir);
while ($filename = readdir($dp)) {
	if (!is_dir($dir."/pics/".$gallery. "/". $filename))  {  									// If it's a file, begin
		$pic_types = array("JPG", "jpg", "GIF", "gif", "PNG", "png"); 		
		if (in_array(substr($filename, -3), $pic_types)) $pic_array[] = $filename;				// If it's a image, add it to pic array
	}
}
foreach ($pic_array as $filename) {
	$media_files = $media_files . " " . $dir . "/" . $filename;
}

$output = `zip -u -j $dir/pics.zip $media_files`;
print $output . "<br>";

print "<pre>$output</pre>";
print 'Complete. The file can be downloaded <a href="'. $blogURI .'/wp-content/plugins/ungallery/source.php?zip='. $dir . '/pics.zip">here</a>';
print  '<br><br>You can return to the gallery <a href="'. $blogURI . $gallery .'?gallerylink=' . $_GET['zip'] .'">here.</a>';

?>