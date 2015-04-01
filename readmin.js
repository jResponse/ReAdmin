/***************************************************
Copyright:jReply LLC, 2015. https://jresponse.net
Demo:http://jresponse.co/readmin
Comments & suggestions:contact@jreply.com
Licensed MIT:http://choosealicense.com/licenses/mit/
****************************************************/
Boolean.prototype.intval = function(places)
{
 places = ('undefined' == typeof(places))?0:places; 
 return (~~this) << places;
}

String.prototype.format = function (args)
{
 var newStr = this,key;
	for (key in args) {newStr = newStr.replace('{' + key + '}', args[key]);}
 return newStr;
}


String.prototype.reverse=function(){return this.split("").reverse().join("");};

function fluidDialog()
{
	var $visible = $(".ui-dialog:visible");
	$visible.each(function()
	{
  var $this = $(this);
		var dialog = $this.find(".ui-dialog-content").data("ui-dialog");
		if (dialog.options.fluid)
		{
   var wWidth = $(window).width();
   if (wWidth < dialog.options.maxWidth + 50)
   {this.css("max-width", "90%");} else 
   {$this.css("max-width", dialog.options.maxWidth);}
			
			if (dialog.options.hasOwnProperty('minWidth')) 
			$this.css("min-width", dialog.options.minWidth + 'px');
   
			if (dialog.options.hasOwnProperty('minHeight')) 
			$this.css("min-height", dialog.options.minHeight + 'px');
   
			if (dialog.options.hasOwnProperty('maxHeight')) 
			$this.css("max-height", dialog.options.maxHeight + 'px');

			dialog.option("position", dialog.options.position);
  }
 });
}

$(document).ready(function()
{
 $('#divKeyTypes').buttonset();
	$('.dabtn').button();
	$('#btnFilter').on('click',doFilter);
	$('#btnAdd').on('click',doAdd);
	$('#btnDelete').on('click',doDelete);
	$('#btnSave').on('click',doSave);
	$('#btnFlush').on('click',doFlush);
	$('#selHits').on('click',showKeyData);
	$('input[name="ktype"]').on('click',doFilter);
	doFilter();
});
//-------------------- Utils ---------------
function escapedValue(v){return $('<div/>').text(v).html();}

function showType(){return parseInt($('input[name="ktype"]').filter(':checked').val());}

function showVersion(){$('#divInfo').show().html(_version);}

function showDeleteHint()
{
 var txt = 'To enable the <b>Delete</b> button hold down the CTRL key &amp; click a hit entry';	
 $('#divInfo').show().html(txt).fadeOut(5000,showVersion);
}

function showError(err){$('#divInfo').html(err).fadeOut(5000,showDeleteHint);}

function noStringCheck(str,msg)
{if ((undefined == str) || (0 == str.length)) throw(msg);}

function afterUpdates(data,rslt)
{
 if ('success' == rslt)
	{
	 try
		{
		 data = JSON.parse(data);
			switch(data.code)
			{
			 case -999:showError('The default keys cannot be updated');break;
			 case -4:showError('Invalid redis type');break;
				case -3:showError('The key cannot be a null string');break;
				case -2:showError('The value cannot be a null string');break;
				case -1:showError('Unable to connect to Redis-server');break;
				case 0:showError('Failed to write to Redis-server');break;
				case 1:$(".ui-dialog:visible").children().filter($('.divDia')).dialog('close');
											fillHits(data.hits);
											if (false !== data.had) 
											{
											 console.log(data.had);
											 showError('The old value has been copied to the Javascript console');
											} else showError('A new key has been added');	
	
			}
		} catch(err){showError(err);}
	}
}
//--------------------------  Filter & Fill -------------------
function doFilter()
{
 var ktype = showType(),
	    filter = $('#inpFilter').val();
	filter = (0 === filter.length)?'*':filter;
 
 var url = "find.php?ktype={kt}&filter={fl}".format({kt:ktype,fl:filter});
 $.get(url,afterFilter);
}

function fillHits(hits)
{
 function hitCount(hCount)
	{
	 if (0 >= hCount) return '';
		return " [{hc}]".format({hc:hCount});
	}
	
 var hit,options = '',count = hits.length,nhits = (1 === count)?' hit':' hits';
	for(var i=0;i < count;i++)
	{
	 hit = hits[i];
		hit.push(hitCount(hit[1]));
		options += "<option data-h='{h0}'>{h1}{h2}</option>".format({h0:hit[0],h1:hit[0],h2:hit[2]});
	}
	$('#selHits').html(options);
	showError(count + nhits);
	$('#btnDelete').attr('disabled',true).button('refresh');
}

function afterFilter(data,rslt)
{
 if ('success' == rslt)
	{
	 try
		{
		 data = JSON.parse(data);
			switch(parseInt(data.code))
			{
			 case -1:showError('Could not connect to Redis-server');break;
				default:fillHits(data.hits);
			}
		} catch(err) {showError(err);}
	}
}
//----------------------- Select Entry -------------------------------
function showKeyData(e)
{
 var toEdit = !(e.ctrlKey || e.shiftKey);
 $('#btnDelete').attr('disabled',toEdit).button('refresh');
	if (toEdit)
	{
	 var key = $('#selHits option:selected').data('h'),
		    ktype = showType(),
						url = "getall.php?k={ky}&t={kt}".format({ky:key,kt:ktype});
		$.get(url,afterGetAll);				
	}
}

function afterGetAll(data,rslt)
{
 if ('success' === rslt)
	{
	 try
		 {
			 data = JSON.parse(data);
				switch(data.code)
				{
				 case -3:showError('Cannot fetch data for an empty key');break;
					case -2:showError('Invalid entry type');break;
					case -1:showError('Could not connect to Redis-server');break;
					case 0:showError('No such key');break;
					case 1:switch(data.ktype)
					       {
												 case 1:showStringEditor(data);break;
													case 2:showSetEditor(data);break;
													case 3:showListEditor(data);break;
													case 4:showZSetEditor(data);break;
													case 5:showHashEditor(data);break;
												}	
				}
			} catch(err){showError(err);}
	}
}
//------------------------ Strings ----------------------------
function showStringEditor(data)
{
 var btns = {Update:doStringUpdate,Cancel:closeStringEditor};
	$('#diaStringEd').dialog({title:'String Editor',
	                          position:{my:'center top',at:'center top',of:window}, 
	                          modal:true,resizable:false,resizable:false,
																											minWidth:500,minHeight:400,
	                          open:function(){fillStringData(data);},
																											beforeClose:cleanUpStrings,
																											buttons:btns});
}

function doStringUpdate()
{
 var key = $('#inpStrKey').val(),
	    valu = $('#txaStrValue').val(),
					ttl = $('#inpStrTTL').val(),
					typ = showType(),
     filter = $('#inpFilter').val();
	filter = (0 === filter.length)?'*':filter;
	
	try
 {				
	 noStringCheck(key,'Please provide a key!');
		noStringCheck(valu,'The value cannot be a null string');
		valu = escapedValue(valu);
  $.post('update.php',{k:key,v:valu,t:ttl,f:filter,ty:typ},afterUpdates);
	} catch(err){showError(err);}
}


function fillStringData(data)
{
 if (undefined !== data)
	{
  $('#inpStrKey').val(data.key);
 	$('#txaStrValue').val(data.values);
	 $('#inpStrTTL').val(data.ttl);
	}
}

function cleanUpStrings()
{
 $('#inpStrKey').val('');
	$('#txaStrValue').val('');
	$('#inpStrTTL').val('0');
}

function closeStringEditor(){$('#diaStringEd').dialog('close');}
//------------------ Sets ----------------------
function showSetEditor(data)
{
 var btns = {Add:newSetEntry,Update:doSetListUpdate,Cancel:closeSetEditor};
	$('#diaSetEd').dialog({title:'Set Editor',
	                          position:{my:'center top',at:'center top',of:window}, 
	                          modal:true,resizable:false,resizable:false,
																											minWidth:500,minHeight:400,
	                          open:function(){fillSetData(data,editSetValue);},
																											beforeClose:cleanUpSets,
																											buttons:btns});

}

function fillSetData(data,vEditor)
{
 if (undefined !== data)
	{
	 $('#inpSetKey').val(data.key);
		$('inpSetTTL').val(data.ttl);
		$('#tblSet').data('set',data.values);
	} else $('#tblSet').data('set',['value']);
	_fillSetData(vEditor);
}

function _fillSetData(vEditor)
{
 var tbl = $('#tblSet'),
	    values = tbl.data('set'),
					valu,mv,html = '',ln = values.length,lnm = ln - 1;
	for(var i=0;i < ln;i++)
	{
	 valu = escapedValue(values[i]);
		mv = (0 !== i).intval() + (lnm !== i).intval(1);
		html += "<tr><td id='v{ndx}' data-m='{m}'>{v}</td></tr>".format({ndx:i,m:mv,v:valu});
	}
	tbl.html(html);
	$('td').on('click',vEditor);
}

function applySetValue()
{
 var inp = $('#inpValu'),
	    ndx = inp.data('n'),
					sets = $('#tblSet').data('set'),
	    v = inp.val();
					
	if (0 === v.length)
	{
	 showError('The value cannot be a null string');
		return;
	}
	sets[ndx] = v;				
	$('#v' + ndx).html(escapedValue(v));
}

function binSetValue()
{
 var ndx = $('#inpValu').data('n'),
	    sets = $('#tblSet').data('set');
	sets.splice(ndx,1);				
	_fillSetData(editSetValue);
}

function discardCurrentSetEditor()
{
 var p = $('#inpValu').parents();
	if (0 < p.length)
	{
  p = p.filter($('td'));
  var ndx = parseInt(p.attr('id').reverse()),
	     sets = $('#tblSet').data('set');
	 p.html(sets[ndx]);
	}	
}

function editSetValue(e)
{
 if (e.target != e.delegateTarget) return;
 discardCurrentSetEditor();
	
 var td = $(e.target),
	    sets = $('#tblSet').data('set'),
	    ndx = parseInt(td.attr('id').reverse()),
					valu = sets[ndx],
					root = "https://jresponse.r.worldssl.net/ide/nimages/",
					imgs = "<img src='{rt1}redtick.png' onclick='applySetValue()' title='Apply'/>" + 
					       "<img src='{rt2}binit.png' onclick='binSetValue()' title='Drop value'/>",
					html = "<div class='tlay'><input data-n='{nd}' id='inpValu' maxlength='128' value='{vv}'><div>{im}</div></div>";
	
 imgs = imgs.format({rt1:root,rt2:root});
 html = html.format({nd:ndx,vv:valu,im:imgs});	
 td.html(html);			
}

function cleanUpSets()
{
 $('#inpSetKey').val('');
	$('#inpSetTTL').val(0);
	$('#tblSet').removeData('set');
	$('tblSet').html('');
}

function closeSetEditor(){$('#diaSetEd').dialog('close');}

function newSetEntry()
{
 var set = $('#tblSet').data('set');
	set.push('value');
	_fillSetData(editSetValue);
}

function doSetListUpdate()
{
 var key = $('#inpSetKey').val(),
	    ttl = $('#inpSetTTL').val(),
     sets = JSON.stringify($('#tblSet').data('set')),
					typ = showType(),
     filter = $('#inpFilter').val();
	filter = (0 === filter.length)?'*':filter;
	
	try
 {				
	 noStringCheck(key,'Please provide a key!');
		$.post('update.php',{k:key,v:sets,t:ttl,f:filter,ty:typ},afterUpdates);
	} catch(err){showError(err);}
}
///------------------ Lists -----------------------
function showListEditor(data)
{
 var btns = {Add:newListEntry,Update:doSetListUpdate,Cancel:closeSetEditor};
	$('#diaSetEd').dialog({title:'List Editor',
	                          position:{my:'center top',at:'center top',of:window}, 
	                          modal:true,resizable:false,resizable:false,
																											minWidth:500,minHeight:400,
	                          open:function(){fillSetData(data,editListValue);},
																											beforeClose:cleanUpSets,
																											buttons:btns});

}

function editListValue(e)
{
 if (e.target != e.delegateTarget) return;
 discardCurrentSetEditor();
	
 var td = $(e.target),
	    m = parseInt(td.data('m')),
	    sets = $('#tblSet').data('set'),
	    ndx = parseInt(td.attr('id').reverse()),
					valu = sets[ndx],
					root = "https://jresponse.r.worldssl.net/ide/nimages/",
					imgs = "<img src='{rt1}redtick.png' onclick='applySetValue()' title='Apply'/>" + 
					       "<img src='{rt2}binit.png' onclick='binSetValue()' title='Drop value'/>",
					html = "<div class='tlay'><input data-n='{nd}' id='inpValu' maxlength='128' value='{vv}'/><div>{im}</div></div>";
	
	switch (m)
	{
	 case 1:imgs += "<img src='{rt3}arrow_up.png' onclick='moveUp()' title='Move Up'/";break;
		case 2:imgs += "<img src='{rt4}arrow_down.png' onclick='moveDown()' title='Move Down'/";break;
		case 3:imgs += "<img src='{rt3}arrow_up.png' onclick='moveUp()' title='Move Up'/";
		       imgs += "<img src='{rt4}arrow_down.png' onclick='moveDown()' title='Move Down'/";break;
	}
 imgs = imgs.format({rt1:root,rt2:root,rt3:root,rt4:root});
 html = html.format({nd:ndx,vv:valu,im:imgs});	
 td.html(html);			
}

function moveUp()
{
 var inp = $('#inpValu'),
	    ndx = inp.data('n'),
					ndxm = ndx - 1,
					sets = $('#tblSet').data('set');
					
	sets.splice(ndxm,0,sets.splice(ndx,1)[0]);
 _fillSetData(editListValue);
	$('td[id="v' + ndxm + '"]').click();
}

function moveDown()
{
 var inp = $('#inpValu'),
	    ndx = inp.data('n'),
					ndxp = ndx + 1,
					sets = $('#tblSet').data('set');
					
	sets.splice(ndxp,0,sets.splice(ndx,1)[0]);
 _fillSetData(editListValue);
	$('td[id="v' + ndxp + '"]').click();
}

function newListEntry()
{
 var set = $('#tblSet').data('set');
	set.push('value');
	_fillSetData(editListValue);
}
//----------------- ZSets ------------------------
function showZSetEditor(data)
{
	var btns = {Add:newZSetEntry,Update:doSSHUpdate,Cancel:closeSSHEditor};
	$('#diaSSH').dialog({title:'Sorted Set Editor',
	                          position:{my:'center top',at:'center top',of:window}, 
	                          modal:true,resizable:false,resizable:false,
																											minWidth:700,minHeight:400,
	                          open:function(){fillSSH(data,editZSetValue,0,'Score','Value');},
																											beforeClose:cleanUpSSH,
																											buttons:btns});

}

function closeSSHEditor(){$('#diaSSH').dialog('close');}

function cleanUpSSH()
{
 $('#inpSSHKey').val('');
	$('#inpSSHTTL').val(0);
	$('#tblSSH').removeData('ssh');
	$('tblSSH').html('');
}

function newZSetEntry()
{
 var ssh = $('#tblSSH').data('ssh'),i = 1,valu = 'v1';
	while (ssh.hasOwnProperty(valu)) valu = 'v' + ++i;
	ssh[valu] = 0;
	_fillSSH(editZSetValue,'Score','Value');
}

function discardCurrentSSHEditor()
{
 var p = $('#inpValu').parents();
	if (0 < p.length)
	{
  var td = p.filter($('td')),
		    tr = p.filter($('tr'));
  var html,key = tr.attr('id').substr(2),
	     ssh = $('#tblSSH').data('ssh'),valu = ssh[key];
		if (td.hasClass('tk')) td.html(valu);else td.html(key);
	}	
	/*
	 Don't alter the ROW html here or else you might invalidate the cell object
		that captured the click event in editZSetValue/etditHashValue
	*/
}

function editZSetValue(e)
{
 if (e.target != e.delegateTarget) return;
 discardCurrentSSHEditor();
 
 var td = $(e.target),
	    ssh = $('#tblSSH').data('ssh'),
	    key = td.parent().attr('id').substr(2),
					forScore = td.hasClass('tk'),valu,
					root = "https://jresponse.r.worldssl.net/ide/nimages/",
					imgs = "<img src='{rt1}redtick.png' onclick='applyZSetValue()' title='Apply'/>" + 
					       "<img src='{rt2}binit.png' onclick='binZSetValue()' title='Drop Member'/>",
					html;

					
 if (forScore) valu = ssh[key];else valu = key;
				
	html = "<div class='tlay'><input data-n='{kk}' id='inpValu' maxlength='128' value='{vv}'/><div>{im}</div></div>";
	
 imgs = imgs.format({rt1:root,rt2:root});
 html = html.format({kk:key,vv:valu,im:imgs});	
	td.html(html);			
}

function isUniqueKey(ssh,key,newKey)
{
 var have,tssh = JSON.parse(JSON.stringify(ssh));
	delete tssh[key];
	have = tssh[newKey];
	return (undefined === have);
	/*
	 We have to ensure that the edit does not create a duplicate key.
		At the same time we have to allow for a cyclic edit which returns the key to its
		original value. So we duplicate the object - we don't want to alter the original yet! -
		remove the current key, then test to see if newkey is not new after all because
		another entry uses that key.
	*/
}

function reSortByScore(ssh)
{
 var sorted = [];
 for (var key in ssh) sorted.push([key,ssh[key]]);
 sorted.sort(function(a,b) {return a[1] - b[1]});
	ssh = {};
	for(var i=0;i < sorted.length;i++) ssh[sorted[i][0]] = sorted[i][1];
	return ssh;
}

function binZSetValue(e)
{
 var key = $('#inpValu').parents().filter($('tr')).attr('id').substr(2),
	    ssh = $('#tblSSH').data('ssh');
	delete ssh[key];
	_fillSSH(editZSetValue,'Score','Value');
}

function applyZSetValue()
{
 var p = $('#inpValu').parents();
	if (0 < p.length)
	{
  var td = p.filter($('td')),
		    tr = p.filter($('tr')),
						key = tr.attr('id').substr(2),
	     ssh = $('#tblSSH').data('ssh'),
						valu = $('#inpValu').val(),
						forScore = td.hasClass('tk');
	 if (forScore) 
		{
		 ssh[key] = valu;
		} else
		{
		 if (isUniqueKey(ssh,key,valu))
			{
			 var newKey = valu;
				valu = ssh[key];
				delete ssh[key];
				ssh[newKey] = valu;
			} else
			{
			 showError('Key values must be unique!');
				return;
			}
		}
		ssh = reSortByScore(ssh);
  $('#tblSSH').removeData('ssh').data('ssh',ssh);
  _fillSSH(editZSetValue,'Score','Value');
	}
}

function _fillSSH(vEditor,Lbl0,Lbl1)
{
 function _buildTable(k,v)
	{
		//value = escapedValue(value);
		var str = "<tr id='zh{ks1}'><td class='tk'>{ks2}</td><td>{rv}</td></tr>";
		html += str.format({ks1:k,ks2:v,rv:k});
	}
 var html = "<thead><tr><th>{L0}</th><th>{L1}</th></tr></thead><tbody>".format({L0:Lbl0,L1:Lbl1}),
	    tbl = $('#tblSSH'),ssh = tbl.data('ssh');
	$.each(ssh,_buildTable);
	tbl.html(html + '</tbody>');
	$('td').on('click',vEditor);
}

function fillSSH(data,vEditor,kORs,Lbl0,Lbl1)
{
 if (undefined !== data)
	{
	 $('#inpSSHKey').val(data.key);
		$('inpSSHTTL').val(data.ttl);
		$('#tblSSH').data('ssh',data.values);
	} else $('#tblSSH').data('ssh',{'v1':kORs});//key for hash,score for zSet
	_fillSSH(vEditor,Lbl0,Lbl1);
}
//-------------------------  Hashes -----------------------
function showHashEditor(data)
{
	var btns = {Add:newHashEntry,Update:doSSHUpdate,Cancel:closeSSHEditor};
	$('#diaSSH').dialog({title:'Hash Editor',
	                          position:{my:'center top',at:'center top',of:window}, 
	                          modal:true,resizable:false,resizable:false,
																											minWidth:700,minHeight:400,
	                          open:function(){fillSSH(data,editHashValue,0,'Hash','Key');},
																											beforeClose:cleanUpSSH,
																											buttons:btns});

}

function newHashEntry()
{
 var ssh = $('#tblSSH').data('ssh'),i = 1,valu = 'v1';
	while (ssh.hasOwnProperty(valu)) valu = 'v' + ++i;
	ssh[valu] = 'hash';
	_fillSSH(editHashValue,'Hash','Key');
}

function editHashValue(e)
{
 if (e.target != e.delegateTarget) return;
 discardCurrentSSHEditor();
 
 var td = $(e.target),
	    ssh = $('#tblSSH').data('ssh'),
	    key = td.parent().attr('id').substr(2),
					forHash = td.hasClass('tk'),valu,
					root = "https://jresponse.r.worldssl.net/ide/nimages/",
					imgs = "<img src='{rt1}redtick.png' onclick='applyHashValue()' title='Apply'/>" + 
					       "<img src='{rt2}binit.png' onclick='binHashValue()' title='Drop Member'/>",
					html;

					
 if (forHash) valu = ssh[key];else valu = key;
				
	html = "<div class='tlay'><input data-n='{kk}' id='inpValu' maxlength='128' value='{vv}'/><div>{im}</div></div>";
	
 imgs = imgs.format({rt1:root,rt2:root});
 html = html.format({kk:key,vv:valu,im:imgs});	
	td.html(html);			
}

function binHashValue(e)
{
 var key = $('#inpValu').parents().filter($('tr')).attr('id').substr(2),
	    ssh = $('#tblSSH').data('ssh');
	delete ssh[key];
	_fillSSH(editHashValue,'Hash','Key');
}

function applyHashValue()
{
 var p = $('#inpValu').parents();
	if (0 < p.length)
	{
  var td = p.filter($('td')),
		    tr = p.filter($('tr')),
						key = tr.attr('id').substr(2),
	     ssh = $('#tblSSH').data('ssh'),
						valu = $('#inpValu').val(),
						forHash = td.hasClass('tk');
	 if (forHash) 
		{
		 ssh[key] = valu;
		} else
		{
		 if (isUniqueKey(ssh,key,valu))
			{
			 var newKey = valu;
				valu = ssh[key];
				delete ssh[key];
				ssh[newKey] = valu;
			} else
			{
			 showError('Key values must be unique!');
				return;
			}
		}
		$('#tblSSH').removeData('ssh').data('ssh',ssh);
  _fillSSH(editHashValue,'Hash','Key');
	}
}

function doSSHUpdate()
{
 var key = $('#inpSSHKey').val(),
	    ttl = $('#inpSSHTTL').val(),
     ssh = JSON.stringify($('#tblSSH').data('ssh')),
					typ = showType(),
     filter = $('#inpFilter').val();
	filter = (0 === filter.length)?'*':filter;
	
	try
 {				
	 noStringCheck(key,'Please provide a key!');
		$.post('update.php',{k:key,v:ssh,t:ttl,f:filter,ty:typ},afterUpdates);
	} catch(err){showError(err);}
}
//------------------ Other Ops ---------------------
function doAdd()
{
 var sType = showType();
	switch(sType)
	{
	 case 1:showStringEditor();break;
		case 2:showSetEditor();break;
		case 3:showListEditor();break;
		case 4:showZSetEditor();break;
		case 5:showHashEditor();break;
	}
}
function doDelete()
{
 var ktype = showType(),
	    key = $('#selHits option:selected').data('h'),
	    filter = $('#inpFilter').val();
	filter = (0 === filter.length)?'*':filter;
 var url = "delete.php?ktype={kt}&filter={fl}&key={ky}".format({kt:ktype,fl:filter,ky:key});
	$.get(url,afterDelete);
}

function afterDelete(data,rslt)
{
 if ('success' == rslt)
	{
	 try
		{
		 data = JSON.parse(data);
			switch(parseInt(data.code))
			{
			 case -999:showError('The default keys cannot be deleted');break;
			 case -2:showError('Missing key. Nothing to delete!');break;
				case -1:showError('Unable to connect to Redis-server');break;
				case 0:showError('There is no such key');break;
				default:fillHits(data.hits);
				        showError('1 key deleted'); 
			}
		} catch(err) {showError(err);}
	}
}

function doSave(){$.get('otherops.php?op=0',afterSaveFlush);}

function doFlush()
{
 var really = window.confirm('Do you REALLY want to flush the entire Redis database?');
	if (really) $.get('otherops.php?op=1',afterSaveFlush);
}

function afterSaveFlush(data,rslt)
{
 if ('success' == rslt)
	{
	 try
		{
		 data = JSON.parse(data);
			switch(data.code)
			{
			 case -999:showError('Operation blocked on the demo server');break;
			 case -2:showError('Invalid operation');break;
				case -1:showError('Unable to connect to Redis-server');break;
				case 0:showError('Operation failed');break;
				case 1:showError('Operation Completed');
				       doFilter();
											break;
			}
		} catch(err){showError(err);}
	}
}
