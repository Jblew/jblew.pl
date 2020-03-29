<?php
    /**
    * Lightbox Plus 2.1 - 2010.07.12
    */
    if (!class_exists('lbp_filters')) {
        class lbp_filters extends lbp_shortcode {

            /**
            * Filter to call page parsing
            *
            * @param mixed $content
            * @return simple_html_dom
            */
            function filterLightboxPlusReplace( $content ) {
                $lightboxPlusOptions = get_option('lightboxplus_options');
                if ($this->phpMinV('4.*') && !$lightboxPlusOptions['use_php_four']) {
                    return $this->lightboxPlusReplace( $content, '' );
                }
                else {
                    return $this->lightboxPlusReplaceOld( $content, '' );
                }

            }

            /**
            * New method to parse page content navigating the dom and replacing found elements with modified HTML to acomodate LBP appropriate HTML
            *
            * @param mixed $content
            * @return mixed
            */
            function lightboxPlusReplace( $html_content, $unq_id ) {
                global $post;

                if (!empty($this->lightboxOptions)) {$lightboxPlusOptions   = $this->getAdminOptions($this->lightboxOptionsName);}
                $postGroupID = $post->ID;
                $postGroupTitle = $post->post_title;

                $html = new simple_html_dom();
                $html->load($html_content);

                /**
                * Find all image links (text and images)
                *
                * If (autolightbox text links) then
                */
                switch ( $lightboxPlusOptions['text_links'] ) {
                    case 1:
                        foreach($html->find('a[href*=jpg$], a[href*=gif$], a[href*=png$], a[href*=jpeg$], a[href*=bmp$]') as $e) {
                            /**
                            * Use Class Method is selected - yes/no
                            */
                            switch ($lightboxPlusOptions['use_class_method']) {
                                case 1:
                                    if ($e->class && $e->class != $lightboxPlusOptions['class_name']) {
                                        $e->class .= ' '.$lightboxPlusOptions['class_name'];
                                        if (!$e->rel) { $e->rel = 'lightbox['.$postGroupID.$unq_id.']'; }
                                    }
                                    else {
                                        $e->class = $lightboxPlusOptions['class_name'];
                                        if (!$e->rel) { $e->rel = 'lightbox['.$postGroupID.$unq_id.']'; }
                                    }
                                    break;
                                default:
                                    if (!$e->rel) { $e->rel = 'lightbox['.$postGroupID.$unq_id.']'; }
                                    break;
                            }

                            /**
                            * Do Not Display Title is select - yes/no
                            */
                            switch ($lightboxPlusOptions['no_display_title']) {
                                case 1:
                                    $e->title = null;
                                    break;
                                default:
                                    /**
                                    * If title doesn't exist then get a title
                                    * Set to caption title->image->post title by default then set to image title is exists
                                    */
                                    if (!$e->title) {
                                        if ($e->first_child()->title) {
                                            $e->title = $e->first_child()->title;
                                        } else {
                                            $e->title = $postGroupTitle;
                                        }
                                    }
                                    /**
                                    * If use caption for title try to get the text from the caption - this could be wrong
                                    */
                                    if ($lightboxPlusOptions['use_caption_title']) {
                                        if ($e->next_sibling()->innertext) { $e->title = $e->next_sibling()->innertext; }
                                    }
                                    break;
                            }
                        }
                        break;
                    default:
                        /**
                        *  find all links with image only else if (do not autolightbox textlinks) then
                        */
                        foreach($html->find('a[href*=jpg$] img, a[href*=gif$] img, a[href*=png$] img, a[href*=jpeg$] img, a[href*=bmp$] img') as $e) {
                            /**
                            * Use Class Method is selected - yes/no
                            */
                            switch ($lightboxPlusOptions['use_class_method']) {
                                case 1:
                                    if ($e->parent()->class && $e->parent()->class != $lightboxPlusOptions['class_name']) {
                                        $e->parent()->class .= ' '.$lightboxPlusOptions['class_name'];
                                        if (!$e->parent()->rel) { $e->parent()->rel = 'lightbox['.$postGroupID.$unq_id.']'; }
                                    }
                                    else {
                                        $e->parent()->class = $lightboxPlusOptions['class_name'];
                                        if (!$e->parent()->rel) { $e->parent()->rel = 'lightbox['.$postGroupID.$unq_id.']'; }
                                    }
                                    break;
                                default:
                                    if (!$e->parent()->rel) { $e->parent()->rel = 'lightbox['.$postGroupID.$unq_id.']'; }
                                    break;
                            }
                            /**
                            * Do Not Display Title is select - yes/no
                            */
                            switch ($lightboxPlusOptions['no_display_title']) {
                                case 1:
                                    $e->parent()->title = null;
                                    break;
                                default:
                                    if (!$e->parent()->title) {
                                        if ($e->title) {
                                            $e->parent()->title = $e->title;
                                        }
                                        else {
                                            $e->parent()->title = $postGroupTitle;
                                        }
                                    }
                                    if ($lightboxPlusOptions['use_caption_title']) {
                                        if ($e->parent()->next_sibling()->innertext) { $e->parent()->title = $e->parent()->next_sibling()->innertext; }
                                    }
                                    break;
                            }
                        }
                        break;
                }

                $content = $html->save();
                $html->clear();
                unset($html);
                return $content.'<!-- PHP 5.x -->';

            }

            /**
            * Old method to parse page content looking for RegEx matches and replace matched with modified HTML to acomodate LBP appropriate HTML
            *
            * @param mixed $content
            * @return mixed
            */
            function lightboxPlusReplaceOld( $content, $unq_id ) {
                global $post;
                global $g_php_version;

                $g_php_version = "PHP 4.x Method";

                if (!empty($this->lightboxOptions)) {$lightboxPlusOptions   = $this->getAdminOptions($this->lightboxOptionsName);}
                $postGroupID = $post->ID;
                /**
                * Auto-Lightbox Match Patterns
                *
                * @var mixed
                */
                $pattern_a[0] = "/<a(.*?)href=('|\")([A-Za-z0-9\/_\.\~\:-]*?)(\.bmp|\.gif|\.jpg|\.jpeg|\.png)('|\")([^\>]*?)><img(.*?)title=('|\")(.*?)('|\")([^\>]*?)\/>/i";
                /**
                * Auto-Lightbox Text Links match patterns
                */
                if ( $lightboxPlusOptions['text_links'] ) {
                    $pattern_a[1] = "/<a(.*?)href=('|\")([A-Za-z0-9\/_\.\~\:-]*?)(\.bmp|\.gif|\.jpg|\.jpeg|\.png)('|\")([^\>]*?)>/i";
                }
                /**
                * General match patterns
                *
                * @var mixed
                */
                $pattern_a[2] = "/<a(.*?)href=('|\")([A-Za-z0-9\/_\.\~\:-]*?)(\.bmp|\.gif|\.jpg|\.jpeg|\.png)('|\")(.*?)(rel=('|\")lightbox(.*?)('|\"))([ \t\r\n\v\f]*?)((rel=('|\")lightbox(.*?)('|\"))?)([ \t\r\n\v\f]?)([^\>]*?)>/i";
                $pattern_a[3] = "/<a(.*?)href=('|\")([A-Za-z0-9\/_\.\~\:-]*?)(\.bmp|\.gif|\.jpg|\.jpeg|\.png)('|\")([^\>]*?)><img(.*?)/i";
                /**
                * Replacement Patterns
                * In case Do Not Display Title is selected
                * Contrary to what the option is called it now does the opposite i.e. switch ( $lightboxPlusOptions['dont_no_display_title'] )
                * Option name was not changed to prevent conflicts
                */
                switch ( $lightboxPlusOptions['no_display_title'] ) {
                    case 1:
                    /**
                    * Using class method - yes/no
                    */
                    switch ( $lightboxPlusOptions['use_class_method'] ) {
                        case 1:
                            $replacement_a[0] = '<a$1href=$2$3$4$5$6 class="'.$lightboxPlusOptions['class_name'].'" rel="lightbox['.$postGroupID.$unq_id.']"><img$7$11/>';
                            break;
                        default:
                            $replacement_a[0] = '<a$1href=$2$3$4$5$6 rel="lightbox['.$postGroupID.$unq_id.']"><img$7$11/>';
                            break;
                    }
                    break;
                    /**
                    * Display title replacment patterns
                    *
                    * Using class method - yes/no
                    */
                    default:
                    switch ( $lightboxPlusOptions['use_class_method'] ) {
                        case 1:
                            $replacement_a[0] = '<a$1href=$2$3$4$5$6 title="$9" class="'.$lightboxPlusOptions['class_name'].'" rel="lightbox['.$postGroupID.$unq_id.']"><img$7title=$8$9$10$11/>';
                            break;
                        default:
                            $replacement_a[0] = '<a$1href=$2$3$4$5$6 title="$9" rel="lightbox['.$postGroupID.$unq_id.']"><img$7title=$8$9$10$11/>';
                            break;
                    }
                    break;
                }

                /**
                * Set replacemnt pattern for auto-lightbox text links
                *
                * Using class method - yes/no
                */
                switch ( $lightboxPlusOptions['text_links'] ) {
                    case 1:
                    switch ( $lightboxPlusOptions['use_class_method'] ) {
                        case 1:
                            $replacement_a[1] = '<a$1href=$2$3$4$5$6 class="'.$lightboxPlusOptions['class_name'].'" rel="lightbox['.$postGroupID.$unq_id.']">';
                            break;
                        default:
                            $replacement_a[1] = '<a$1href=$2$3$4$5$6 rel="lightbox['.$postGroupID.$unq_id.']">';
                            break;
                    }
                }
                /**
                * Additional replacement patterns
                *
                * @var mixed
                */
                $replacement_a[2] = '<a$1href=$2$3$4$5$6$7>';
                $replacement_a[3] = '<a$1href=$2$3$4$5$6 rel="lightbox['.$postGroupID.$unq_id.']"><img$7';

                $content = preg_replace( $pattern_a, $replacement_a, $content );

                /**
                * Correct extra title and standardize quotes to double for links
                *
                * @var mixed
                */
                $pattern_b[0] = "/title='(.*?)'/i";
                $pattern_b[1] = "/href='([A-Za-z0-9\/_\.\~\:-]*?)(\.bmp|\.gif|\.jpg|\.jpeg|\.png)'/i";
                $pattern_b[2] = "/rel=('|\")lightbox(.*?)('|\") rel=('|\")lightbox(.*?)('|\")/i";
                $replacement_b[0] = '';
                $replacement_b[1] = 'href="$1$2"';
                $replacement_b[2] = 'rel=$1lightbox$2$3';
                $content = preg_replace( $pattern_b, $replacement_b, $content );
                return $content.'<!-- PHP 4.x -->';;
            }
        }
    }

?>
