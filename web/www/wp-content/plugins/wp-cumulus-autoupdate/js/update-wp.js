jQuery(document).ready(function() {
  jQuery(".wrap").append("<p>Proveravam SWF fajl...</p>");
  jQuery.ajax({
    type: "GET",
    cache: false,
    url: "../wp-content/plugins/wp-cumulus-autoupdate/?ajax&rand="+Math.random(),
    dataType: "html",
    success: function(html){
      jQuery(".wrap").append("<p>"+html+"</p>");
      jQuery(".wrap").append("<p><sub>Posvećeno Brisu Tatonu, francuskom navijaču kojeg su huligani <a href=\"http://www.b92.net/info/vesti/index.php?yyyy=2009&mm=09&dd=17&nav_category=16&nav_id=382022\" target=\"_blank\">na smrt pretukli</a> u centru Beograda 17.09.2009. godine, a koji je <a href=\"http://www.b92.net/info/vesti/index.php?yyyy=2009&mm=09&dd=29&nav_id=383878\" target=\"_blank\">podlegao povredama</a> 12 dana kasnije u bolnici, 29.09.2009. godine.</sub></p>");
    }
  });
});