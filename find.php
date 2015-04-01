<?php
/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/

require 'filter.php';

$type = (isset($_GET['ktype']))?$_GET['ktype']:'1';
$filter = (isset($_GET['filter']))?$_GET['filter']:'*';

$redis = new Redis();
if ($redis->connect('127.0.0.1',6379))
{
 $out = _filter($filter,$type,$redis,$count);
	echo json_encode(array('code'=>$count,'hits'=>$out));
} else echo(json_encode(array('code'=>-1)));
?>
