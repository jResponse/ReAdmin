<?php
/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/

function dieWith($err){die(json_encode(array('code'=>$err)));}

$key = (isset($_GET['k']))?$_GET['k']:null;
$type = (isset($_GET['t']))?$_GET['t']:'1';

if (null == $key) dieWith(-3);
$type = intval($type);
if ((0 >= $type) || (5 < $type)) dieWith(-2);

$redis = new Redis();
if ($redis->connect('127.0.0.1',6379))
{
 if ($redis->exists($key))
	{
  $ttl = $redis->pttl($key);
		$ttl = (0 > $ttl)?0:$ttl;
		switch($type)
		{
		 case 1:$values = $redis->get($key);break;
			case 2:$values = $redis->sMembers($key);break;
			case 3:$values = $redis->lRange($key,0,-1);break;
			case 4:$values = $redis->zRange($key,0,-1,true);break;
			case 5:$values = $redis->hGetAll($key);break;
		}
		echo json_encode(array('code'=>1,'ktype'=>$type,'values'=>$values,'ttl'=>$ttl,'key'=>$key));
	} else dieWith(0);	
} else dieWith(-1);
?>
