<?php // Do not delete these lines
if ('comments.php' == basename($_SERVER['SCRIPT_FILENAME'])) die ('Please do not load this page directly. Thanks!');
if (!empty($post->post_password)) { // if there's a password
	if ($_COOKIE['wp-postpass_' . COOKIEHASH] != $post->post_password) {  // and it doesn't match the cookie
?>

<h2><?php _e('Wymagane hasło.'); ?></h2>
<p><?php _e('Podaj hasło, żeby zobaczyc komentarze.'); ?></p>

<?php return;
	}
}

	/* This variable is for alternating comment background */

$oddcomment = 'alt';

?>

<!-- You can start editing here. -->

<?php if ($comments) : ?>
	
	<h3 id="comments"><?php comments_number('Brak Komentarzy', 'Jeden Komentarz', '% Komentarzy' );?></h3>

<ol class="commentlist">  
<?php foreach ($comments as $comment) : ?>  
<li <?php echo $oddcomment; ?>id="comment-<?php comment_ID() ?>">  
<div class="quote"><?php comment_text() ?></div>  
<?php if ($comment->comment_approved == '0') : ?>  
<em>Twoj komentarz oczekuje na moderację</em>  
<?php endif; ?>  
</li>  
<cite><?php comment_author_link() ?> on <a href="#comment-<?php comment_ID() ?>" title=""><?php comment_date('F jS, Y') ?> at <?php comment_time() ?> <?php edit_comment_link('edit','&nbsp;&nbsp;',''); ?></a></cite>  
<?php  
/* Changes every other comment to a different class */  
$oddcomment = ( empty( $oddcomment ) ) ? 'class="alt" ' : '';  
?>  
<?php endforeach; /* end for each comment */ ?>  
</ol>  

	

<?php else : // this is displayed if there are no comments so far ?>

<?php if ('open' == $post->comment_status) : ?>
	
	<?php else : ?>

	
<p class="nocomments">Komentarze są zamknięte.</p>

	<?php endif; ?>
<?php endif; ?>


<?php if ('open' == $post->comment_status) : ?>
<br /><br />
		<h3 id="respond">Skomentuj</h3>

<?php if ( get_option('comment_registration') && !$user_ID ) : ?>
<p>Musisz się <a href="<?php echo get_option('siteurl'); ?>/wp-login.php?redirect_to=<?php the_permalink(); ?>">zalogowac</a> żaby napisac komentarz.</p>

<?php else : ?>

<form action="<?php echo get_option('siteurl'); ?>/wp-comments-post.php" method="post" id="commentform">
<?php if ( $user_ID ) : ?>

<p style="padding: 0;margin: 0;padding-left: 15px;">Zalogowany jako <a href="<?php echo get_option('siteurl'); ?>/wp-admin/profile.php"><?php echo $user_identity; ?></a> &#124 <a href="<?php echo get_option('siteurl'); ?>/wp-login.php?action=logout" title="Wyloguj się">Wyloguj się</a></p>

<?php else : ?>

<p><input type="text" name="author" id="author" value="<?php echo $comment_author; ?>" size="40" tabindex="1" />
<label for="author"><small>Imie: <?php if ($req) echo "(wymagane)"; ?></small></label></p>

<p><input type="text" name="email" id="email" value="<?php echo $comment_author_email; ?>" size="40" tabindex="2" />
<label for="email"><small>E-Mail: (nie publikowany) <?php if ($req) echo "(wymagane)"; ?></small></label></p>

<p><input type="text" name="url" id="url" value="<?php echo $comment_author_url; ?>" size="40" tabindex="3" />
<label for="url"><small>Strona internetowa</small></label></p>

<?php endif; ?>

<!--<p><small><strong>XHTML:</strong> <?php _e('You can use these tags&#58;'); ?> <?php echo allowed_tags(); ?></small></p>-->

<p><textarea name="comment" id="comment" cols="60" rows="10" tabindex="4"></textarea></p>

<p><input name="submit" type="submit" id="submit" tabindex="5" value="Wyślij >" />
<input type="hidden" name="comment_post_ID" value="<?php echo $id; ?>" />
</p>

<?php do_action('comment_form', $post->ID); ?>

</form>

<?php endif; ?>

<?php endif; ?>