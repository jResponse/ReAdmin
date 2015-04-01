<?php
/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/

function _filter($filter,$type,$redis,&$count)
{
 $keys = $redis->keys($filter);
	$out = array();
	if (is_array($keys))
	{
	 foreach($keys as $key)
		{
		 $typ = $redis->type($key);
			if ($typ == $type) 
			{
			 switch($typ)
				{
				 case 1:$count = -1;break;
					case 2:$count = $redis->sSize($key);break;
					case 3:$count = $redis->lSize($key);break;
					case 4:$count = $redis->zSize($key);break;
					case 5:$count = count($redis->hKeys($key));break;
				}
				$out[] = array($key,$count);
			}	
		}
		sort($out);
 }
	$count = count($out);
 return $out;
}
