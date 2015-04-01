<?php
/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/
function dieWith($err){die(json_encode(array('code'=>$err)));}

dieWith(-999);
//This code does not execute on the demo server. Uncomment it for your own needs
/*
$op = (isset($_GET['op']))?$_GET['op']:'0';
$op = intval($op);
if ((0 > $op) || (1 < $op)) dieWith(-2);

$redis = new Redis();
if ($redis->connect('127.0.0.1',6379))
{
 switch($op)
	{
	 case 0:$rslt = $redis->save();break;
		case 1:$rslt = $redis->flushDB();break;
	}
	dieWith(intval($rslt));
} else dieWith(-1);*/
?>
