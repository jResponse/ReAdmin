<?php
/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/
require 'filter.php';
function dieWith($err){die(json_encode(array('code'=>$err)));}

$type = (isset($_GET['ktype']))?$_GET['ktype']:'1';
$filter = (isset($_GET['filter']))?$_GET['filter']:'*';
$key = (isset($_GET['key']))?$_GET['key']:null;
if (false !== strpos('string,set,list,zset,hash',$key)) dieWith(-999);
//the default keys may not be deleted - comment out Line 8 for your own installation
if (null === $key) dieWith(-2);
$redis = new Redis();
if ($redis->connect('127.0.0.1',6379))
{
 $rv = $redis->delete($key);
	trigger_error(json_encode($rv));
	if (false === $rv) dieWith(0);
	$out = _filter($filter,$type,$redis,$count);
	echo json_encode(array('code'=>1,'hits'=>$out));
} else dieWith(-1);
?>
