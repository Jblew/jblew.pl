<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />

<?php if ( is_single() ): ?>
<title><?php wp_title(''); ?></title>
<?php
else:
?>
<title>JBLew - blog o elektronice i programowaniu - notatnik młodego programisty</title>
<?php
endif;
?>
<meta name="generator" content="WordPress <?php bloginfo('version'); ?>" /> <!-- leave this for stats -->
<meta http-equiv="Description" content="<?php wp_title(' &raquo; '); ?> - <?php bloginfo('name'); ?>: blog na temat elektroniki, webmasteringu, programowania. <?php if ( is_single() ) { ?> Artykuł: <?php } ?>" />
<meta http-equiv="Author" content="Jędrzej Lewandowski" />
<meta http-equiv="Keywords" content="<?php
function cmpcount($a, $b)
{
    if ($a->count == $b->count) {
        return 0;
    }
    return ($a->count < $b->count) ? 1 : -1;
}
function cmp($a, $b)
{
    if ($a->name == $b->name) {
        return 0;
    }
    return ($a->name < $b->name) ? -1 : 1;
}

$tags = get_tags();
usort($tags, "cmp");
usort($tags, "cmpcount");
$pierwszy = true;
foreach($tags as $tag) {
    if(!$pierwszy) echo(", ");
    echo($tag->name);
    $pierwszy = false;
}
?>, JBLew, notatnik, schematy, układy" />
<?php
//print_r(list_tags());
?>
<link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="<?php bloginfo('rss2_url'); ?>" />
<link rel="alternate" type="text/xml" title="RSS .92" href="<?php bloginfo('rss_url'); ?>" />
<link rel="alternate" type="application/atom+xml" title="Atom" href="<?php bloginfo('atom_url'); ?>" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

<?php wp_get_archives('type=monthly&format=link'); ?>

<?php wp_head(); ?>
<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />
</head>
