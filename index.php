--<?php
if (!class_exists('Redis')) die('Please install php-redis, restart your webserver & try again');
if (false === strpos($_SERVER['HTTP_USER_AGENT'],'Chrome')) 
die('This application only works in Chrome and Opera');
$redis = new Redis();
if ($redis->connect('127.0.0.1', 6379))
{
 $rv = $redis->info()['redis_version'];
	$rs = $redis->dbSize();
	$rver = "<b>Redis Version</b>:{$rv} <b>Key Count</b>:{$rs}";
} else $rver = 'Not Connected';
?>

<!doctype HTML>
<html>
<!--
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
-->
<head>
<title>Redis Web Admin GUI</title>
<link rel="shortcut icon" href='https://1928868936.rsc.cdn77.org/ide/nimages/redis.png'/>
<link rel="stylesheet" href="https://1928868936.rsc.cdn77.org/styles/darkness.css" />
<link rel='stylesheet' href='readmin.css'/>
<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'></script>
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js"></script>
<script>
<?php echo "_version = '{$rver}';"; ?>
</script>
<script src='readmin.js'></script>
</head>
<body>
<h1>Redis Administrator</h1>
<div class='lay'>
<span>View</span>
<div class='divBox'>
<div id='divKeyTypes'>
<input id='inpKT1' type='radio' name='ktype' value='1' checked/><label for='inpKT1'>Strings</label>
<input id='inpKT2' type='radio' name='ktype' value='2'/><label for='inpKT2'>Sets</label>
<input id='inpKT3' type='radio' name='ktype' value='3'/><label for='inpKT3'>Lists</label>
<input id='inpKT4' type='radio' name='ktype' value='4'/><label for='inpKT4'>ZSets</label>
<input id='inpKT5' type='radio' name='ktype' value='5'/><label for='inpKT5'>Hashes</label>
</div>
</div>
</div>
<div class='lay'>
<span>Filter</span>
<input id='inpFilter' value='*' maxlength='64'/>
<button class='dabtn' id='btnFilter'>Filter</button>
</div>
<div class='lay'>
<span>Hits</span>
<select id='selHits' size='8'>
</select>
</div>
<div class='lay'>
<span>Commands</span>
<div class='divBox'>
<div class='flx'>
<div>
<button class='dabtn' id='btnAdd'>Add</button>
<button class='dabtn' id='btnSave'>Save</button>
</div>
<div>
<button class='dabtn' id='btnDelete' disabled>Delete</button>
<button class='dabtn' id='btnFlush'>Flush</button>
</div>
</div>

</div>
</div>
<div id='divInfo'>
<?php echo $rver; ?>
</div>
<p id='pCopy'>Copyright &copy; <a href='https://jresponse.net' target='_blank'>jReply LLC, 2015</a></p>
<div id='diaStringEd' class='divDia'>
<div class='lay'>
<span>Key</span>
<input id='inpStrKey' maxlength='24'/>
</div>
<div class='lay'>
<span>Value</span>
<textarea id='txaStrValue' cols='40' rows='4' maxlength='512'></textarea>
</div>
<div class='lay'>
<span>TTL (ms)</span>
<input id='inpStrTTL' type='number' min='0' step = 1' value='0'/>
</div>
<div class='divFootnote'>0 = No TTL</div>
</div>
<div id='diaSetEd' class='divDia'>
<div class='lay'>
<span>Key</span>
<input id='inpSetKey' maxlength='24'/>
</div>
<div class='lay'>
<span>TTL (ms)</span>
<input id='inpSetTTL' type='number' min='0' step = 1' value='0'/>
</div>
<div class='lay'>
<span>Values</span>
<div class='divEd'>
<table id='tblSet'>
</table>
</div>
</div>
<div class='divFootnote'>0 = No TTL</div>
</div>
<div id='diaSSH' class='divDia'>
<div class='xlay'>
<span>Key</span>
<input id='inpSSHKey' maxlength='24'/>
</div>
<div class='xlay'>
<span>TTL (ms)</span>
<input id='inpSSHTTL' type='number' min='0' step = 1' value='0'/>
</div>
<div class='xlay'>
<span>Members</span>
<div class='divEd'>
<table id='tblSSH'>
</table>
</div>
</div>
<div class='divFootnote'>0 = No TTL</div>
</div>

</body>
</html>
