<?php
$twitter_posts_rss_url = "http://twitter.com/statuses/user_timeline/208555786.rss";

/**
 * Get a web file (HTML, XHTML, XML, image, etc.) from a URL.  Return an
 * array containing the HTTP server response header fields and content.
 */
function get_web_page( $url )
{
    $options = array(
        CURLOPT_RETURNTRANSFER => true,     // return web page
        CURLOPT_HEADER         => false,    // don't return headers
        CURLOPT_FOLLOWLOCATION => true,     // follow redirects
        CURLOPT_ENCODING       => "",       // handle all encodings
        CURLOPT_USERAGENT      => "wp-twitter", // who am i
        CURLOPT_AUTOREFERER    => true,     // set referer on redirect
        CURLOPT_CONNECTTIMEOUT => 120,      // timeout on connect
        CURLOPT_TIMEOUT        => 120,      // timeout on response
        CURLOPT_MAXREDIRS      => 10,       // stop after 10 redirects
    );

    $ch      = curl_init( $url );
    curl_setopt_array( $ch, $options );
    $content = curl_exec( $ch );
    $err     = curl_errno( $ch );
    $errmsg  = curl_error( $ch );
    $header  = curl_getinfo( $ch );
    curl_close( $ch );

    $header['errno']   = $err;
    $header['errmsg']  = $errmsg;
    $header['content'] = $content;
    return $header;
}

$page = get_web_page($twitter_posts_rss_url);

var_dump($page);

$objDOM = new DOMDocument(); 
$objDOM->loadXML($page);
$item = $objDOM->getElementsByTagName("item"); 
$output = "";
foreach( $item as $value ) { 
    $titles = $value->getElementsByTagName("title"); 
    $title  = $titles->item(0)
        ->nodeValue; 
    $pubDates = $value->getElementsByTagName("pubDate"); 
    $pubDate  = $pubDates->item(0)->nodeValue; 
    $links = $value->getElementsByTagName("link"); 
    $link  = $links->item(0)->nodeValue; 
    $output .= "$title|||$pubDate|||$link\n"; 
} 
$file= fopen("tweets.txt", "w+");
fwrite($file, $output);
fclose($file);
?>
