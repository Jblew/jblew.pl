<?php

if ( function_exists('register_sidebar') )
    register_sidebar(array(
        'before_widget' => '<div class="widget">',
    'after_widget' => '</div>',
 'before_title' => '<h3>',
        'after_title' => '</h3>',
    ));

function style_tag_cloud($tags)
{
	$tags = preg_replace_callback("|(class='tag-link-[0-9]+)('.*?)(style='font-size: )([0-9]+)(pt;')|",
		create_function(
			'$match',
			'$low=1; $high=5; $sz=($match[4]-8.0)/(22-8)*($high-$low)+$low; return "{$match[1]} tagsz-{$sz}{$match[2]}";'
		),
		$tags);
	return $tags;
}

// Hook into the rendering of the tag cloud widget
add_action('wp_tag_cloud', 'style_tag_cloud');

?>
