
            
            <?php if ( !function_exists('dynamic_sidebar')
        || !dynamic_sidebar() ) : ?>
		<div class="item">
			<div class="title">Tags</div>
			<div class="content">
				<?php the_tags(); ?>
			</div>
		</div>	
 		<div class="widget">
			<h3>Tags</h3>

			<ul>
				
			</ul>
		</div>
			
		<div class="item">
			<div class="title"><?php _e('Blogroll'); ?></div>
			<div class="content">
			<ul>
				<?php get_links(-1, '<li>', '</li>', '', FALSE, 'name', FALSE, FALSE, -1, FALSE); ?>
			</ul>
			</div>
		</div>
		<div class="item">
			<div class="title"><?php _e('Meta'); ?></div>
			<div class="content">
			<ul>

				<li><a href="<?php bloginfo('rss2_url'); ?>" title="<?php _e('Syndicate this site using RSS'); ?>"><?php _e('<abbr title="Really Simple Syndication">RSS</abbr>'); ?></a></li>

				<li><a href="<?php bloginfo('comments_rss2_url'); ?>" title="<?php _e('The latest comments to all posts in RSS'); ?>"><?php _e('Comments <abbr title="Really Simple Syndication">RSS</abbr>'); ?></a></li>

				<li><a href="http://validator.w3.org/check/referer" title="<?php _e('This page validates as XHTML 1.0 Transitional'); ?>"><?php _e('Valid <abbr title="eXtensible HyperText Markup Language">XHTML</abbr>'); ?></a></li>

				<li><a href="http://gmpg.org/xfn/"><abbr title="XHTML Friends Network">XFN</abbr></a></li>

				<?php wp_meta(); ?>

			</ul>		
			</div>
			</div>
<?php endif; ?>

        <?php
		/*<!--<div class="widget">
			<h3>Zobacz też...</h3>
			<a style="border: 0;" href="http://www.webhack.xaa.pl/"><img style="border: 0;" src="/wp-content/themes/th/images/banner.png" /></a>
		</div>-->*/
		?>
