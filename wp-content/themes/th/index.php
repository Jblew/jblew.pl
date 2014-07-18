<?php get_header(); ?>

<?php

function formatujdate($ts) {
    if(date("j.F.Y", $ts) == date("j.F.Y", time())) return "Dzisiaj o ".date("H:i", $ts);
    else if(date("j.F.Y", $ts) == date("j.F.Y", strtotime("yesterday"))) return "Wczoraj o ".date("H:i", $ts);
    else return str_ireplace(array("January", "February", "March", "May", "June", "July", "August", "September", "October", "November", "December"), array("Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"), date("j F Y  H:i", $ts));
}

function startsWith($haystack,$needle,$case=true) {
    if($case){return (strcmp(substr($haystack, 0, strlen($needle)),$needle)===0);}
    return (strcasecmp(substr($haystack, 0, strlen($needle)),$needle)===0);
}

$toph = "h2 class=\"wtitle\">";
$tophe = "h2>";
if(is_single()) {
    $toph = "h1>";
    $tophe = "h1>";
}
?>

<body>
<?php

$stweets = file_get_contents("tweets.txt");
//echo("<!--".$tweets."-->");
$atweets = explode("\n", $stweets);
$tweets = array();
$ni = 0;
foreach($atweets as $atweet) {
    if(!empty($atweet)) {
        $tmparr = explode("|||", $atweet);
        $tweets[$ni]['text'] = str_replace("JBLew_pl:", "", $tmparr[0]);
        $tweets[$ni]['date'] = strtotime($tmparr[1])+3600; //dodaje godzine, z powodu innej strefy czasowej //rozwiazanie tymczasowe //zmienic
        $tweets[$ni]['link'] = $tmparr[2];    
        $tweets[$ni]['printed'] = false;
        $ni++;
    }
}
//echo("<!--");
//print_r($tweets);
//echo("-->");
?>
<div id="maincontainer">
	<div id="headerclicker"><a href="<?php if(startsWith($_SERVER["HTTP_HOST"], "blog")) {echo('http://www.jblew.pl/');} else { echo('http://blog.jblew.pl/'); } ?>"><div>Jblew.pl - Notatnik młodego programisty. Elektronika, webmastering, programowanie.</div></a></div>
	<div id="ctdiv">
	<table id="cttable">
		<tr>
			<td id="contentcontainer">
        	<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
        	<?php
        	    if(!is_single()) {
        	        $newer_post = null;
        	        $ci = 1;
        	        while(is_null($newer_post)) {
        	            $tmp_newer_post = @get_post($tmp_var=(($post->ID)+$ci));
        	            if(isset($tmp_newer_post->post_status) && $tmp_newer_post->post_status == "publish") $newer_post = $tmp_newer_post;
        	            /*else {
        	                echo("!!!!!!!".(($post->ID)+$ci)."!!!!!!!\n");
        	                var_dump($tmp_newer_post);
        	                echo("!!!!!!!!!!!!!!\n");
        	            }*/
        	            $ci++;
        	            if($ci > 100) break;
        	        }        	        
        	        //echo("<!--");
        	        //var_dump($newer_post);
        	        //echo("-->");
        	        
        	        //echo("<!--");
        	        //var_dump($post);
        	        //echo("-->");
                    
        	        $post_thetime = strtotime($post->post_date);
        	        if(!is_null($newer_post)) $newer_post_thetime = strtotime($newer_post->post_date);
        	        else $newer_post_thetime = time()+259200;
        	        //echo("<!--post-time: ".date("r", $post_thetime)."; newer-time: ".date("r", $newer_post_thetime)."-->");
        	        $ni = 0;
        	        $twfirst = true;
        	        foreach($tweets as $tweet) {
        	            if($tweet['printed'] == false && ($tweet['date'] > $post_thetime) && ($tweet['date'] < $newer_post_thetime)) {
        	                echo('<h2 class="tweet');
        	                if($twfirst) echo(" twitter-img");
        	                else echo(" twitter-noimg");
        	                echo('" title="JBLew na Twitterze"><span class="tweet_date">'.formatujdate($tweet['date']).'</span><a rel=\'external nofollow\' class="tweet_link" href="'.$tweet['link'].'"> '.$tweet['text'].'</a></h2><br />');
        	                $tweets[$ni]['printed'] = true;
        	                $twfirst = false;
        	            }
        	        }
        	    }
        	?>
        		<div class="post">
            		<div class="post-title"><<?php echo($toph); ?><a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title(); ?>"><?php the_title(); ?></a></<?php echo($tophe); ?></div>
                	<div class="post-content">
                    <?php the_content('Zobacz więcej &raquo;'); ?></div><!-- End Post Content -->
                    <table style="width: 100%;" class="post-meta"><tr><td align="left"><?php the_author(); ?>, &nbsp;<?php the_time('j F Y'); ?></td><td align="right"><?php comments_popup_link(__('Skomentuj &#187;', 'kubrick'), __('Skomentuj(1) &#187;', 'kubrick'), __('Skomentuj(%) &#187;', 'kubrick'), '', __('Komentarze zamknięte', 'kubrick') ); ?></td></tr></table>
        	</div><!--End post -->
        	<?php
        		if(is_single()) echo("<a href=\"/?w=g\">Zobacz inne artykuły &gt;</a><br /><br />");
        		else echo("<br /><br /><br />");
        	?>
        	<?php
        		if(is_single()) comments_template(); 
        	?>
            <?php endwhile; else: ?>
        	<h1 align="center">Nie znaleziono</h1>

			<p align="center">Sprobuj użyć wyszukiwarki lub przeszukaj archiwa.</p>
		<?php endif; ?>
        
        <div class="navigation">
			<div class="alignleft"><?php next_posts_link(__('&laquo; Starsze', 'kubrick')) ?></div>
			<div class="alignright"><?php previous_posts_link(__('Nowsze &raquo;', 'kubrick')) ?></div>
		</div>
        
        <!-- End Container All --> 
        </td>
				<td id="rightmenu"><?php get_sidebar(); ?></td>
	</tr>
	</table>
</div>
</div>
<div id="bottom">
<?php get_footer(); ?>
</div>
