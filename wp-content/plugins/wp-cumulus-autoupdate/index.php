<?php
//trebace nam Dinketov cURL klijent
include "curl_http_client.php";

//javni link do swf fajla sa našim slovima
$swfurl = "http://blog.avramovic.info/wp-content/plugins/wp-cumulus-autoupdate/tagcloud.swf";

//tagcloud path
$swflocalpath = "../wp-cumulus/tagcloud.swf";
$swffilename = basename($swflocalpath);

//moj blog post
$blogpost = "http://blog.avramovic.info/2009/09/29/wp-cumulus-automatsko-azuriranje-nasih-slova/";

//ako GM skripta zove php - ne izbacujemo nista u browser
if (isset($_REQUEST['ajax'])) ob_start();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link href="main.css" rel="stylesheet" type="text/css" media="screen" />
    <link href="info-messages.css" rel="stylesheet" type="text/css" media="screen" />
    <title>WP-Cumulus - skripta za automatsko ažuriranje naših slova</title>
    <meta http-equiv="imagetoolbar" content="no" />
</head>

<body id="home">
<div id="mainwrap">
    <div id="main" class="clearfix">
              <div class="flash-title"><h2>WP-Cumulus - skripta za automatsko ažuriranje naših slova</h2></div>
              <div class="content">
<?php
//provera da li je fajl chmodovan
if (!is_writable($swflocalpath))
{
	echo "<p class='warning'>Fajl <strong>$swflocalpath</strong> nije upisiv. Promenite mu dozvole (CHMOD) na <strong>777</strong>.</p>";
	HTMLFooter();
	die();
}

//ima li curl-a?
$curl = extension_loaded('curl');
//dozvoljen li je URL u fopen?
$allowurls = (bool)ini_get('allow_url_fopen');

//provera udaljenog MD5
if ($curl)
{
	$curl = &new Curl_HTTP_Client();
	$curl->init();
	$useragent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.3) Gecko/20090824 Firefox/3.5.3";
	$curl->set_user_agent($useragent);

	$swfmd5udaljeni = trim($curl->fetch_url($swfurl.'.md5.php'));
}
else if ($allowurls)
{
	ob_start();
	readfile($swfurl.'.md5.php');
	$swfmd5udaljeni = trim(ob_get_clean());
}
else
{
	$message = "Izgleda da na serveru nemate ni <strong>cURL</strong> niti je <strong>allow_url_fopen</strong> postavljen na 1 u <strong>php.ini</strong> fajlu. Jedna od ove dve opcije je neophodna za rad ove skripte.";
	echo "<p class='warning'>$message</p>\n";
	HTMLFooter();
	die();
}

//provera lokalnog MD5
$swfmd5lokalni = (is_file($swflocalpath)) ? md5_file($swflocalpath) : '';

if ($swfmd5lokalni != $swfmd5udaljeni)
{
	if ($curl)
	{
		echo "<p class='info'>Fajl se preuzima (<strong>cURL</strong>)...</p>\n";

		$buffer = $curl->fetch_url($swfurl);

		$fs = fopen($swflocalpath,"wb");
		$ok = fwrite($fs, $buffer);
		fclose($fs);

		$swfmd5novi = md5_file($swflocalpath);
		$ok = ($swfmd5novi == $swfmd5udaljeni);

		if ($ok) {
			$message = "Fajl <strong>$swffilename</strong> je uspešno ažuriran na verziju sa našim slovima.";
			echo "<p class='success'>$message</p>\n";
		}
		else
		{
			$message = "Došlo je do greške u preuzimanju fajla (<strong>cURL</strong>) $swffilename! <a href='$blogpost' target='_blank'>Kontaktirajte autora</a> za detalje, ili <a href='javascript:;' onclick='document.location.reload();'>pokušajte ponovo</a>.";
			echo "<p class='error'>$message</p>\n";
		}

	}
	else if ($allowurls)
	{
		echo "<p class='info'>Fajl se preuzima (<strong>fopen()</strong>)...</p>";

		//skidamo fajl
		ob_start();
		readfile($swfurl);
		$buffer = ob_get_clean();

		$fs = fopen($swflocalpath,"w");
		$okfwrt = fwrite($fs, $buffer);
		fclose($fs);

		if (!$okfwrt)
		{
			$message = "Došlo e do greške u pisanju fajla <strong>$swffilename</strong> - proverite njegov CHMOD.";
			echo "<p class='error'>$message</p>\n";
		}
		else
		{
			$swfmd5novi = md5_file($swflocalpath);
			$ok = ($swfmd5novi == $swfmd5udaljeni);

			if ($ok)
			{
				$message = "Fajl <strong>$swffilename</strong> je uspešno ažuriran na verziju sa našim slovima.";
				echo "<p class='success'>$message</p>\n";
			}
			else
			{
				$message = "Došlo je do greške u preuzimanju fajla (<strong>fopen()</strong>) $swffilename! <a href='$blogpost' target='_blank'>Kontaktirajte autora</a> za detalje, ili <a href='javascript:;' onclick='document.location.reload();'>pokušajte ponovo</a>.";
				echo "<p class='error'>$message</p>\n";
			}
		}

	}
	else
	{
		$message = "Izgleda da na serveru nemate ni <strong>cURL</strong> niti je <strong>allow_url_fopen</strong> postavljen na 1 u <strong>php.ini</strong> fajlu. Jedna od ove dve opcije je neophodna za rad ove skripte.";
		echo "<p class='warning'>$message</p>\n";
	}


}
else
{
	//fajlovi su identični
	$message = "Izgleda da već posedujete fajl <strong>$swffilename</strong> sa našim slovima, te s toga nema potrebe za ažuriranjem.";
	echo "<p class='info'>$message</p>\n";
}


function HTMLFooter() {
global $blogpost, $message;

?>
          <p class="info"><sub>Posvećeno Brisu Tatonu, francuskom navijaču kojeg su huligani <a href="http://www.b92.net/info/vesti/index.php?yyyy=2009&mm=09&dd=17&nav_category=16&nav_id=382022" target="_blank">na smrt pretukli</a> u centru Beograda 17.09.2009. godine, a koji je <a href="http://www.b92.net/info/vesti/index.php?yyyy=2009&mm=09&dd=29&nav_id=383878" target="_blank">podlegao povredama</a> 12 dana kasnije u bolnici, 29.09.2009. godine.</sub></p>

				  <br />
                  <div class="content-bottom"><a href="<?php echo $blogpost; ?>" target="_blank" class="readmore">Ova skripta na Avramovom bRlogu</a></div>
              </div>
            </div>
        </div>
        <div id="footer" class="clr">
<?php
$cpyear = 2009;
echo (date('Y',time()) == $cpyear) ? $cpyear . '.' : $cpyear . ' - ' . date('Y', time()) . '.';
?> &copy; Nemanja Avramović
        </div>
    </div>
</div>
</body>
</html>
<?php

	//ajax output?
	if (isset($_REQUEST['ajax']))
	{
		ob_end_clean();
		header("Content-type: text/html; charset=utf-8");
		echo $message;
	}

}

HTMLFooter();
?>