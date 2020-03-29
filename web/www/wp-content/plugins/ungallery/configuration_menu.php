<?php

// Hook for adding admin menus
add_action('admin_menu', 'mt_add_pages');

// action function for above hook
function mt_add_pages() {
    // Add a new submenu under Settings:
    add_options_page(__('UnGallery','ungallery_menu'), __('UnGallery','ungallery_menu'), 'manage_options', 'ungallerysettings', 'mt_settings_page');
}

// mt_settings_page() displays the page content for the Test settings submenu
function mt_settings_page() {
	
	// Create cache directory at ./<WordPress install dir>/wp-content/cache/
	if (!is_dir($_SERVER['DOCUMENT_ROOT']."/wp-content/cache/")) {
		mkdir($_SERVER['DOCUMENT_ROOT']."/wp-content/cache/");
		chmod($_SERVER['DOCUMENT_ROOT']."/wp-content/cache/", 0700);
	}

    //must check that the user has the required capability 
    if (!current_user_can('manage_options'))
    {
      wp_die( __('You do not have sufficient permissions to access this page.') );
    }	

	// form hidden variable
	$hidden_field_name = 'mt_submit_hidden';
    
    // variables for the version field  
    $version_name = 'version';
    $version_data_field_name = 'version';

    // variables for the version field  
    $version_name = 'version';
    $version_data_field_name = 'version';

    // variables for the gallery URL string field 
    $gallery_name = 'gallery';
    $gallery_data_field_name = 'gallery';

    // variables for the path to images field  
    $path_name = 'images_path';
    $path_data_field_name = 'images_path';

    // variables for the hidden field  
    $hidden_name = 'hidden';
    $hidden_data_field_name = 'hidden';

    // variables for the columns field  
    $columns_name = 'columns';
    $columns_data_field_name = 'columns';

    // variables for the marquee field  
    $marquee_name = 'marquee';
    $marquee_data_field_name = 'marquee';

    // variables for the marquee size field  
    $marquee_size_name = 'marquee_size';
    $marquee_size_data_field_name = 'marquee_size';

    // variables for the thumbnail width field  
    $thumbnail_name = 'thumbnail';
    $thumbnail_data_field_name = 'thumbnail';

    // variables for the web view width field  
    $browse_view_name = 'browse_view';
    $browse_view_data_field_name = 'browse_view';

    // variables for the movie player height field  
    $movie_height_name = 'movie_height';
    $movie_height_data_field_name = 'movie_height';

    // variables for the movie player width field  
    $movie_width_name = 'movie_width';
    $movie_width_data_field_name = 'movie_width';

    // Read in existing option value from database
    $version_val = get_option( $version_name );
    $gallery_val = get_option( $gallery_name );
    $path_val = get_option( $path_name );
    $hidden_val = get_option( $hidden_name );
    $columns_val = get_option( $columns_name );
    $marquee_val = get_option( $marquee_name );
    $marquee_size_val = get_option( $marquee_size_name );
    $thumbnail_val = get_option( $thumbnail_name );
    $browse_view_val = get_option( $browse_view_name );
    $movie_height_val = get_option( $movie_height_name );
    $movie_width_val = get_option( $movie_width_name );

    // Apply defaults to form if db field is blank 
    if ($gallery_val == "") $gallery_val = "gallery";
    if ($columns_val == "") $columns_val = "4";
    if ($hidden_val == "") $hidden_val = "hidden";
    if ($thumbnail_val == "") $thumbnail_val = "145";
    if ($browse_view_val == "") $browse_view_val = "440";
    if ($marquee_val == "") $marquee_val = "no";
    if ($movie_height_val == "") $movie_height_val = "495";
    if ($movie_width_val == "") $movie_width_val = "640";
    if ($marquee_size_val == "") $marquee_size_val = "700";


    // See if the user has posted us some information
    // If they did, this hidden field will be set to 'Y'
    if( isset($_POST[ $hidden_field_name ]) && $_POST[ $hidden_field_name ] == 'Y' ) {
        // Read their posted value
        $gallery_val = $_POST[ $gallery_data_field_name ];
        $path_val = $_POST[ $path_data_field_name ];
        $hidden_val = $_POST[ $hidden_data_field_name ];
        $columns_val = $_POST[ $columns_data_field_name ];
        $marquee_val = $_POST[ $marquee_data_field_name ];
        $marquee_size_val = $_POST[ $marquee_size_data_field_name ];
        $thumbnail_val = $_POST[ $thumbnail_data_field_name ];
        $browse_view_val = $_POST[ $browse_view_data_field_name ];
        $movie_height_val = $_POST[ $movie_height_data_field_name ];
        $movie_width_val = $_POST[ $movie_width_data_field_name ];

        // Save the posted value in the database
        update_option( $version_name, $version_val );
        update_option( $gallery_name, $gallery_val );
        update_option( $path_name, $path_val );
        update_option( $hidden_name, $hidden_val );
        update_option( $columns_name, $columns_val );
        update_option( $marquee_name, $marquee_val );
        update_option( $marquee_size_name, $marquee_size_val );
        update_option( $thumbnail_name, $thumbnail_val );
        update_option( $browse_view_name, $browse_view_val );
        update_option( $movie_height_name, $movie_height_val );
        update_option( $movie_width_name, $movie_width_val );

        // Put settings updated message on the screen

?>
<div class="updated"><p><strong><?php _e('settings saved.', 'images_path' ); ?></strong></p></div>
<?php

    }

    // Now display the settings editing screen

    echo '<div class="wrap">';

    // header

    echo "<h2>" . __( 'UnGallery Plugin Settings', 'images_path' ) . "</h2>";

    // settings form

?>

<h3>General Settings</h3>	
<form name="form1" method="post" action="">
<input type="hidden" name="<?php echo $hidden_field_name; ?>" value="Y">

Gallery version: <input type="text" readonly name="<?php echo $version_data_field_name; ?>" value="<?php echo $version_val; ?>" size="20">

<p><?php _e("Gallery permalink:", 'gallery' ); ?> 
<input type="text" name="<?php echo $gallery_data_field_name; ?>" value="<?php echo $gallery_val; ?>" size="20">
Default: gallery (the lower case name of the page you created)
</p>

<p><?php _e("Path to image directory:", 'images_path' ); ?> 
<input type="text" name="<?php echo $path_data_field_name; ?>" value="<?php echo $path_val; ?>" size="30"> 	<br>
<br>
Because hosting environments differ here are a few path tips: <br>
	<br>
	&nbsp;1. Use the absolute path from the root like: /home/users/your_domain/images/ not relative to your website like: ../images/<br>
	&nbsp;2. The trailing slash/ is required. <br>
	&nbsp;3. You can find the full path to a directory on a linux system, by typing 'pwd' at the command prompt.  <br>
	&nbsp;4. On your server, this path to this admin page is: <b><?php print getcwd() ?>/ </b><br>
</p>

<hr />

<h3>Layout Settings</h3>
<p><?php _e("Number of thumbnail columns:", 'columns' ); ?> 
<input type="text" name="<?php echo $columns_data_field_name; ?>" value="<?php echo $columns_val; ?>" size="20">
Default: 4
</p>

<p><?php _e("Thumbnail width in pixels:", 'thumbnail' ); ?> 
<input type="text" name="<?php echo $thumbnail_data_field_name; ?>" value="<?php echo $thumbnail_val; ?>" size="20">
Default: 145
</p>

<p><?php _e("Selected picture width in pixels:", 'browse_view' ); ?> 
<input type="text" name="<?php echo $browse_view_data_field_name; ?>" value="<?php echo $browse_view_val; ?>" size="20">
Default: 440
</p>

<p><?php _e("Movie player height in pixels:", 'movie_height' ); ?> 
<input type="text" name="<?php echo $movie_height_data_field_name; ?>" value="<?php echo $movie_height_val; ?>" size="20">
Example: 490
<p></p>
<?php _e("Movie player width in pixels:", 'movie_width' ); ?> 
<input type="text" name="<?php echo $movie_width_data_field_name; ?>" value="<?php echo $movie_width_val; ?>" size="20">
Example: 640
</p>

<p><?php _e("Use a marquee picture at the top level?:", 'marquee' ); ?> 
<input type="text" name="<?php echo $marquee_data_field_name; ?>" value="<?php echo $marquee_val; ?>" size="20">
Default: no  ("yes" for a single larger photo at the top level)<p></p>
<?php _e("Marquee view picture width in pixels:", 'marquee_size' ); ?> 
<input type="text" name="<?php echo $marquee_size_data_field_name; ?>" value="<?php echo $marquee_size_val; ?>" size="20">
Example: 640
</p><hr />

<h3>Advanced Options</h3>

<p><?php _e("Name used for hidden galleries:", 'hidden' ); ?> 
<input type="text" name="<?php echo $hidden_data_field_name; ?>" value="<?php echo $hidden_val; ?>" size="20">
Example: hidden
</p>

<p class="submit">
<input type="submit" name="Submit" class="button-primary" value="<?php esc_attr_e('Save Changes') ?>" />
</p>

</form>
</div>

<?php
 
}

?>