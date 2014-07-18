
<?php
$startTime = microtime(true);


function transformDocument($path, $processor, $toString) {
    $xmlDoc = new DOMDocument();
    $xmlDoc->load($path);
    $includeTags = $xmlDoc->getElementsByTagName("kosma-include-file");
    foreach($includeTags as $includeTag) {
        $replacementNode = new DOMText("");
        if($includeTag->hasAttributes()) {
            $pathAttribute = $includeTag->attributes->getNamedItem("path");
            if($pathAttribute != null) {
                $relativeReplacementPath = $pathAttribute->value;
                $semiAbsoluteReplacementPath = dirname($path) . DS . $relativeReplacementPath;
                $embeddedDoc = transformDocument($semiAbsoluteReplacementPath, $processor, false);                
                $pageContentElement = $embeddedDoc->getElementById("page-content");
                $pageContentElement->setAttribute("id", "page-content-".uniqid());
                $replacementNode = $xmlDoc->importNode($pageContentElement, true);
                
                //$transformedDocument = 
                //$replacementNode = $transformedDocument->documentElement;
                //echo("Node: ".$pageContentElement->C14N()."\n");
                //$replacementNode = $xmlDoc->importNode($replacementNode, true);
                //$xmlDoc->appendChild($replacementNode);
                //$replacementNode = $xmlDoc->createElement("kosma-insert-comment", "would be replaced with: ".$semiAbsoluteReplacementPath."");
            }
            else {
                $replacementNode = $xmlDoc->createElement("kosma-insert-comment", "Error: empty path attribute specified for kosma-include-file.");
            }
        }
        else {
            $replacementNode = $xmlDoc->createElement("kosma-insert-comment", "Error: no path attribute specified for kosma-include-file.");
        }
        $parentTag = $includeTag->parentNode;
        $parentTag->replaceChild($replacementNode, $includeTag);
        //echo("Node: ".$replacementNode->C14N()."\n");
    }
    if($toString) {
        return $processor->transformToXML($xmlDoc);
    }
    else {
        return $processor->transformToDoc($xmlDoc);
    }
}

define("DS", "/");
define("INTERNAL_FILES_DIR", "internal_files");
define("PAGES_DIR", INTERNAL_FILES_DIR . DS . "pages");
define("XSL_STYLESHEET_FILE", INTERNAL_FILES_DIR . DS . "stylesheet.xsl");
define("FRONTPAGE_FILE", PAGES_DIR . DS . "frontpage.xml");


$pagePath = FRONTPAGE_FILE;
$url = $_SERVER["REQUEST_URI"];
if(!empty($url) && $url != "/") {
    $pagePath = PAGES_DIR . DS . $url . ".xml";
}

$xslDoc = new DOMDocument();
$xslDoc->load(XSL_STYLESHEET_FILE);
$proc = new XSLTProcessor();
$proc->importStylesheet($xslDoc);

$content = transformDocument($pagePath, $proc, true);

$interval = microtime(true)-$startTime;
?>

<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <title>TTitle</title>
  <meta name="description" content="TDesc">
  <meta name="author" content="Jblew">
  <link rel="stylesheet" href="style.css">
  <!--[if lt IE 9]>
  <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
  <![endif]-->
</head>
<body>
<?php echo $content; ?>
</body>
</html>


<?php
echo("<!-- Generating time: ".($interval*1000)."ms -->");
?>