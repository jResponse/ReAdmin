<?php
/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/
require 'filter.php';
function dieWith($err){die(json_encode(array('code'=>$err)));}

function updateRedisString($redis,$key,$ttl,$value,&$old)
{
 $old = $redis->get($key);
 $done = (0 < $ttl)?$redis->psetex($key,$ttl,$value):$redis->set($key,$value);
 return $done;
}	

function updateRedisSet($redis,$key,$ttl,$sets,&$old)
{
 if ($redis->exists($key)) 
	{
	 $old = $redis->sMembers($key);
		$redis->delete($key);
	}else $old = false;
	
	$sets = json_decode($sets);
	$done = 0;
	foreach($sets as $set) $done += $redis->sAdd($key,$set);
		if (0 !== $done)
	{
	 if  (0 < $ttl) $redis->pexpire($key,$ttl);
		return true;
	} else return false;
}

function updateRedisList($redis,$key,$ttl,$sets,&$old)
{
 if ($redis->exists($key)) 
	{
	 $old = $redis->lRange($key,0,-1);
		$redis->delete($key);
	}else $old = false;
	
	$sets = json_decode($sets);
	$done = 0;
	foreach($sets as $set) $done = $redis->rPush($key,$set);
		if (0 !== $done)
	{
	 if  (0 < $ttl) $redis->pexpire($key,$ttl);
		return true;
	} else return false;
}

function updateRedisZSet($redis,$key,$ttl,$zsets,&$old)
{
 if ($redis->exists($key)) 
	{
	 $old = $redis->zRange($key,0,-1,true);
		$redis->delete($key);
	}else $old = false;
	
	$zsets = json_decode($zsets,true);
	$done = 0;
	foreach($zsets as $zkey=>$zscore) $done += $redis->zAdd($key,$zscore,$zkey);
		if (0 !== $done)
	{
	 if  (0 < $ttl) $redis->pexpire($key,$ttl);
		return true;
	} else return false;
}

function updateRedisHash($redis,$key,$ttl,$hashes,&$old)
{
 if ($redis->exists($key)) 
	{
	 $old = $redis->hGetAll($key);
		$redis->delete($key);
	}else $old = false;
	
	$hashes = json_decode($hashes);
	$done = 0;
	foreach($hashes as $hkey=>$hash) $done = $redis->hset($key,$hkey,$hash);
		if (0 !== $done)
	{
	 if  (0 < $ttl) $redis->pexpire($key,$ttl);
		return true;
	} else return false;
}

$key = (isset($_REQUEST['k']))?$_REQUEST['k']:null;
$value = (isset($_REQUEST['v']))?$_REQUEST['v']:null;
$filter = (isset($_REQUEST['f']))?$_REQUEST['f']:'*';
$ttl = (isset($_REQUEST['t']))?$_REQUEST['t']:'0';
$typ = (isset($_REQUEST['ty']))?$_REQUEST['ty']:'0';

if (false !== strpos('string,set,list,zset,hash',$key)) dieWith(-999);
//the default keys may not be modified comment out line 90 for your own installation
$typ = intval($typ);
if ((0 >= $typ) || (5 < $typ)) dieWith(-4);
if (null === $key) dieWith(-3);
if (null === $value) dieWith(-2);
$ttl = intval($ttl);
$ttl = (0 > $ttl)?0:$ttl;
$key = addslashes($key);

$redis = new Redis();
if ($redis->connect('127.0.0.1',6379))
{
 $old = '';
 switch($typ)
	{
	 case 1:$done = updateRedisString($redis,$key,$ttl,$value,$old);break;
		case 2:$done = updateRedisSet($redis,$key,$ttl,$value,$old);break;
		case 3:$done = updateRedisList($redis,$key,$ttl,$value,$old);break;
		case 4:$done = updateRedisZSet($redis,$key,$ttl,$value,$old);break;
		case 5:$done = updateRedisHash($redis,$key,$ttl,$value,$old);break;
	}
	if (!$done) dieWith(0);
	$out = _filter($filter,$typ,$redis,$count);
	echo json_encode(array('code'=>1,'had'=>$old,'count'=>$count,'hits'=>$out));
} else dieWith(-1);
?>
