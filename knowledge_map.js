// 说明：有三个点，会涉及到两个分支。（新建，重画）（保存，另存）（保存前的删除，列表中的删除）
var knowledge_map = {
  userid : 0,
  courseid : 0,
  ksname : [],              //存储userid本身和0的ksname，为了autocomplete用
  ksid : [],                //存储ksname对应的ksid。新增知识点，添加了系统已有的知识点时，需要用到ksid
  instance : {},
  overlays : [],
  connectors : [],          //结构图中的连线
  rootid : 0,               //根节点的id：ksmid_ksid.随机模式下，根节点内容不能变
  nodes_pid : [],           //存储节点的父节点，key为数组中的序号，value为节点的id
  nodes : [],               //结构图中的节点
  dblclick_source : {},     //当前处理的双击源，把dialog做成全局的需要
  ksmid : '',               //当前处理的结构图的id，把dialog做成全局的需要
  ksmid_ksmname : {}        //key:ksmid;value:ksmname。修改ksmname，再打开结构图时，通过它找到ksmname。
};

//点击我的列表调用的函数：加载所有的ksname，只需运行一次
function knowledge_map_js_showKnowledgeMapList(){ 
  console.log('start');
  //呈现我的列表需要初始化的信息
  knowledge_map.userid = 1;
  knowledge_map.courseid = 1;
  knowledge_map.ksname = [],              
  knowledge_map.ksid = [],                
  knowledge_map.instance = {},
  knowledge_map.overlays = [],
  knowledge_map.connectors = [],          
  knowledge_map.rootid = 0,   
  knowledge_map.nodes_pid = [];
  knowledge_map.nodes = [];
  knowledge_map.dblclick_source = {};
  knowledge_map.ksmid = '';
  knowledge_map.ksmid_ksmname = {};   

  var tabTempName = '我的列表';    
  var content=''; 

  content+="<table class='AJAX_TABLE_ID' cellspacing='0' ><thead><tr><th scope=col style='padding-left:9px'>标识</th><th scope=col style='padding-left:9px'>名称</th><th scope=col style='padding-left:9px'>删除</th><th scope=col style='padding-left:9px'>得分</th><th scope=col style='padding-left:9px'>评论意见</th></tr></thead>";
  content+="<tbody>";
  content+="<tr><img height=29px width=29px src='../image/processing.gif'></img>&nbsp;数据正在加载请稍候...</tr>"
  content+='</tbody></table>';
  content+='<div id="knowledge_map_list_pagination" class="pagination">';
  content+='</div>';
  addTab('knowledge_map_list',tabTempName,content);

  var argsdata={"userid":knowledge_map.userid, "courseid":knowledge_map.courseid};
  var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'getKsname',args:JSON.stringify(argsdata)};
  var success=function(data){
    //找出用户的知识点名称:ksname, ksid
    console.log('getKsname 返回成功');
    console.log('getKsname:'+data);

    for(var i=0; i<data.length; i++){      
      knowledge_map.ksname.push(data[i][0]);
      knowledge_map.ksid.push(data[i][1]);
    }       

    knowledge_map_js_showKnowledgeMapListCode();          
  };
  invoke_proxy(data,success);
}

//获取我的列表中每条记录的信息，并加载代码
function knowledge_map_js_showKnowledgeMapListCode(){
  var argsdata={"userid":knowledge_map.userid, "courseid":knowledge_map.courseid};
  var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'getUCKsmInfo',args:JSON.stringify(argsdata)};
  var success=function(data){
    //找出用户的结构图id：ksmname, ksmid, comment, score
    console.log('getUCKsmInfo 返回成功'); 
    console.log('getUCKsmInfo data:'+data);       
        
    var newcontent='';
    newcontent+="<p id='dialog_help' style='display:none'></p>"
    newcontent+="<button id='new_kl'>新建</button>";

    //修改结构图的名字
    newcontent += '<div id="dialog-name-modify" title="修改结构图的名字" style="font-size: 100%;">';
    newcontent += '<form style="margin:0;">';
    newcontent += '<fieldset style="padding:0; border:0; margin-top:25px;"><label for="name">名字:</label>';
    newcontent += '<input type="text" name="klm_name" id="klm_name" style="margin-bottom:12px; width:70%; padding: .4em;" class="text ui-widget-content ui-corner-all">';
    newcontent += '</fieldset>';  
    newcontent += '</form></div>';

    //另存对话框
    newcontent += '<div id="dialog-save" title="另存" style="font-size: 100%;">';
    newcontent += '<form style="margin:0;">';
    newcontent += '<fieldset style="padding:0; border:0; margin-top:25px;"><label for="name">名字:</label>';
    newcontent += '<input type="text" name="kl_save_name" id="kl_save_name" style="margin-bottom:12px; width:70%; padding: .4em;" class="text ui-widget-content ui-corner-all">';
    newcontent += '</fieldset>';  
    newcontent += '</form></div>';

    newcontent += '<div id="dialog-form" title="创建新知识点" style="font-size: 100%;">';
    newcontent += '<p class="validateTips">所有的表单字段都是必填的。</p>';
    newcontent += '<form>';
    newcontent += '<fieldset style="padding:0; border:0; margin-top:25px;">';
    newcontent += '<label for="name">名字:</label>';
    newcontent += '<input type="text" name="name" style="margin-bottom:12px; width:70%; padding: .4em;" id="name" class="text ui-widget-content ui-corner-all">';
    newcontent += '<button type="button" name="add_node" id="add_node">新增</button>';
    newcontent += '</fieldset>';
    newcontent += '<fieldset style="padding:0; border:0; margin-top:25px;">';
    newcontent += '<label for="note" class="note_label">笔记:</label>';
    newcontent += '<textarea rows="3" cols="20" name="note" id="dialog_note" style="width: 80%;height: 100%;vertical-align: top;resize: none;" class="note text ui-widget-content ui-corner-all"> </textarea>';
    newcontent += '</fieldset></form></div>';

    //评论意见对话框
    newcontent += '<div id="dialog-comment" title="评论意见" style="font-size: 100%%;">';
    newcontent += '<form style="margin:0;">';
    newcontent += '<fieldset style="padding:0; border:0; margin-top:25px;">';
    newcontent += '<label for="dialog_comment_t">评论意见:</label>';
    newcontent += '<textarea disabled="disabled" rows="3" cols="20" name="dialog_comment_t" id="dialog_comment_t" style="width: 80%;height: 20%;vertical-align: top;resize: none;" class="text ui-widget-content ui-corner-all"> </textarea>';
    newcontent += '</fieldset>';  
    newcontent += '</form></div>';

    //新建结构图对话框
    newcontent += '<div id="dialog-kl" title="创建新结构图" style="font-size: 100%;">';
    newcontent += '<form style="margin:0;">';
    newcontent += '<fieldset style="padding:0; border:0; margin-top:25px;"><label for="name">名字:</label>';
    newcontent += '<input type="text" name="name" id="kl_name" style="margin-bottom:12px; width:70%; padding: .4em;" class="text ui-widget-content ui-corner-all">';
    newcontent += '</fieldset>';  
    newcontent += '</form></div>';
    newcontent+="<table class='AJAX_TABLE_ID' cellspacing='0' ><thead><tr><th scope=col style='padding-left:9px'>标识</th><th scope=col style='padding-left:9px'>名称</th><th scope=col style='padding-left:9px'>删除</th><th scope=col style='padding-left:9px'>得分</th><th scope=col style='padding-left:9px'>评论意见</th></tr></thead>";
    newcontent+="<tbody>";
    //data:ksmname, ksmid, comment, score
    if(data != ''){      
      for(var i = 0; i<data.length; i++){
        knowledge_map.ksmid_ksmname[data[i][1]] =  data[i][0];
        // 拼接tr        
        newcontent+="<tr>";
        var tema="<a title='打开' href='javascript:;' onclick='knowledge_map_js_openKnowledgeMap("+data[i][1]+", \""+data[i][2]+"\")'>打开</a>";
        newcontent+=("<td style='padding-left:9px'>"+ tema +"</td>");                  
        var tema="<a title='名字' href='javascript:;' id='list_ksmname"+data[i][1]+"' >"+data[i][0]+"</a>";
        newcontent+=("<td class='list_ksmname' style='padding-left:9px'>"+tema+"</td>");
        tema="<a title='删除' href='javascript:;' onclick='knowledge_map_js_delKsmid("+data[i][1]+",0)'>删除</a>";  
        newcontent+=("<td style='padding-left:9px'>"+ tema +"</td>");        
        newcontent+=("<td style='padding-left:9px'>"+ (data[i][3]) +"</td>");
        // 显示固定长度的评论        
        if(data[i][2].length < 22){
          newcontent+=("<td style='padding-left:9px'><p class='list_comment' style='line-height: 33px;margin:0;padding:0 4px;'>"+data[i][2]+"</p><p style='display:none'>"+data[i][2]+"</p></td>");
        }else{
          newcontent+=("<td style='padding-left:9px'><p class='list_comment' style='line-height: 33px;margin:0;padding:0 4px;'>"+data[i][2].substring(0,21)+"</p><p style='display:none'>"+data[i][2]+"</p></td>");
        }
        newcontent+="</tr>";
      }
    }else{
      newcontent+="<tr>";
      newcontent+=("<td colspan='100%' align='center'>暂时没有数据</td>");
      newcontent+="</tr>";
    }    
    newcontent+='</tbody></table>';
    $('#cknowledge_map_list').html(newcontent);
    
    //新增节点名称
    $('#add_node').click(function(){
      // 新增节点的条件：不为空；knowledge_map.ksname没有此知识点      
      var flag=0;
      if($("#name").val() != ''){
        for(var i=0;i<knowledge_map.ksname.length;i++){
          if($("#name").val()==knowledge_map.ksname[i]){
            flag=1;
          }
        }
        if(flag==1)
        {
          alert("系统中已有此知识点，不能新增");
        }else{
          knowledge_map.ksname.push($("#name").val());
          knowledge_map_js_saveNewKs($("#name").val(), knowledge_map.ksmid, knowledge_map.dblclick_source);
        }
      }else{
        //文本框的内容为空
        alert('未输入知识点的名字');
      }     
    });

    //局部变量，列表中双击评论时的事件源。_list:我的列表中加的class或id
    var click_target_list = {};
    $('.list_comment').dblclick(function(e){
        e = e || window.event;
        click_target_list = e.target || e.srcElement;
        $( "#dialog-comment").dialog( "open" );
    });

    // 配置评论对话框
    $("#dialog-comment").dialog({      
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      open: function() {
        // 捕获 enter 键盘事件
      	$(this).bind("keypress.ui-dialog", function(event){
   		  if(event.keyCode == $.ui.keyCode.ENTER){
            console.log('enter');
            return false;
          }
        });
        // 给对话框中的元素赋评论的内容
        $("#dialog_comment_t").text($(click_target_list).text());
      },
      buttons: {        
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() { 
      }
    });  

    //修改结构图的名字
    $('.list_ksmname').click(function(e){
      console.log('修改结构图的名字');
      e = e || window.event;
      click_target_list = e.target || e.srcElement;
      $( "#dialog-name-modify" ).dialog( "open" );
    });

    //修改结构图名字的对话框
    $("#dialog-name-modify").dialog({      
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        open: function(){
          // 捕获 enter 键盘事件
          $(this).bind("keypress.ui-dialog", function(event){
          if(event.keyCode == $.ui.keyCode.ENTER){
              return false;
            }
          });
          // 赋值
          $("#klm_name").val($(click_target_list).text());
        },        
        buttons: {          
          "确定": function() {
            console.log('queding');
            // 可以修改的条件：不为空；不重复
            if($("#klm_name").val()!='')
            {
              var flag=0;
              for(var i=1;i<$('#cknowledge_map_list tr').length;i++)
              {
                if($($($('#cknowledge_map_list tr')[i]).find('td')[1]).text()==$("#klm_name").val())
                {
                  flag=1;
                }
              }
              if(flag==0)
              {
                // 赋值：对话框到结构图名字
                $(click_target_list).text($("#klm_name").val());
                var ksmid_t = $(click_target_list).attr('id').replace('list_ksmname','');
                // 修改knowledge_map.ksmid_ksmname的内容
                knowledge_map.ksmid_ksmname[ksmid_t]=$("#klm_name").val();
                $( this ).dialog( "close" );
              }else{
                alert("结构图的名称重复，请重新输入");
              }
            }else{
              alert('请输入结构图的名称');
            }       
          },
          Cancel: function() {
            $( this ).dialog( "close" );
            console.log('cancel');
          }
        },
        close: function() { 
        }
      }); 

    //新建 结构图 事件
    $('#new_kl').click(function(){      
      $( "#dialog-kl" ).dialog( "open" );
    });

    //新建 对话框的事件
    $("#dialog-kl").dialog({      
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        open: function(){
          // 捕获 enter 键盘事件
	        $(this).bind("keypress.ui-dialog", function(event){
	   		  if(event.keyCode == $.ui.keyCode.ENTER){
	            console.log('enter');
	            return false;
	          }
	        });
          // 赋默认值
          $("#kl_name").val('结构图的名字'); 
        },        
        buttons: {          
          "确定": function() {
            // 可以新建的条件：不为空，不重复
          	if($("#kl_name").val()!='')
          	{
          		var flag=0;
       				for(var i=1;i<$('#cknowledge_map_list tr').length;i++)
       				{
       					if($($($('#cknowledge_map_list tr')[i]).find('td')[1]).text()==$("#kl_name").val())
       					{
       						flag=1;
       					}
       				}
            	if(flag==0)
            	{
              		knowledge_map_js_newKnowledgeMap($("#kl_name").val());
              		$( this ).dialog( "close" );
              	}else{
              		alert("结构图的名称重复，请重新输入");
              	}
            }else{
              alert('请输入结构图的名称');
            }       
          },
          Cancel: function() {
            $( this ).dialog( "close" );
          }
        },
        close: function() { 
        }
      });

    // 另存的对话框，调用它的方法在knowledge_map_js_newKnowledgeMapJs
    $("#dialog-save").dialog({      
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        open: function() {
          // 捕获enter 键盘事件
        	$(this).bind("keypress.ui-dialog", function(event){
	   		  if(event.keyCode == $.ui.keyCode.ENTER){
	            console.log('enter');
	            return false;
	          }
	        });
          // 赋值
          var ksmid = knowledge_map.ksmid;           
          $("#kl_save_name").attr('value', $('#tshowklgMapDetailPage_'+ksmid).text().replace('  ×',''));  
        },
        buttons: {           
          "确定": function() {
           var ksmid = knowledge_map.ksmid; 
           knowledge_map_js_beforeSaveAnotherCheck($("#kl_save_name").val(), ksmid);
           $( this ).dialog( "close" );
          },      
          Cancel: function() {
            $( this ).dialog( "close" );
          }
        },
        close: function() { 
        }
      });

      //节点 对话框的事件：调用它的方法在knowledge_map_js_newKnowledgeMapJs
      $("#dialog-form").dialog({      
          autoOpen: false,
          height: 300,
          width: 350,
          modal: true,
          open: function() {
            // 捕获enter 键盘事件
	          $(this).bind("keypress.ui-dialog", function(event){
		   		  if(event.keyCode == $.ui.keyCode.ENTER){
		            console.log('enter');
		            return false;
		          }
		        });
            // 赋值
            var dblclick_source = knowledge_map.dblclick_source;
            $("#name").val($(dblclick_source).text());
            $('#dialog_note').val($('#'+$(dblclick_source).attr('id').replace('node_name','node_note')).text());            
             },
          buttons: {                     
            "确定": function() {           
              if($("#name").val() != ''){
                //成功条件：不为空，不重复 
                var flag = 0;
                for(var i=0; i<knowledge_map.ksname.length; i++){
                  // 根据对话框中节点的名字，查找ksname数组
                  if(knowledge_map.ksname[i] == $("#name").val()){
                    flag = 1;
                    // 把全局变量变为局部变量
                    var dblclick_source = knowledge_map.dblclick_source;
                    var ksmid = knowledge_map.ksmid; 
                    //把对话框中的内容赋给节点
                    $(dblclick_source).text($("#name").val());
                    var nodeh_id = $(dblclick_source).attr('id').replace('node_name','node_nameh');
                    $('#'+nodeh_id).text($("#name").val());             
                    var node_note_id = $(dblclick_source).attr('id').replace('node_name','node_note');
                    $('#'+node_note_id).text($('#dialog_note').val());

                    // 找到对应的ksid
                    var already_ksid = knowledge_map.ksid[i]; 
                    // 找ksmid                      
                    var node_id = $(dblclick_source).attr('id').replace('node_name','');
                    var already_ksmdid=node_id.split('_')[2];

                    //记录连线的信息
                    var connector_array = knowledge_map.instance.getConnections();
                    var old_node=$(dblclick_source).attr('id').replace('node_name','node');
                    var connector_array_memory = [];
                    for(var j=0; j<connector_array.length; j++){
                      var connector_t=connector_array[j];
                      var source_t = $(connector_t.source).attr('id');
                      var target_t = $(connector_t.target).attr('id');   
                      if(source_t==old_node)
                      {
                        var line={};
                        line.source = source_t;
                        line.target = target_t;
                        connector_array_memory.push(line);
                      }
                      if(target_t==old_node)            
                      {
                        var line={};
                        line.source = source_t;
                        line.target = target_t;
                        connector_array_memory.push(line);
                      }
                    }
      
                    //删除端点
                    knowledge_map.instance.deleteEndpoint('node'+node_id+'-bottom');
                    knowledge_map.instance.deleteEndpoint('node'+node_id+'-top');

                    //更改端点的id
                    $('#node'+node_id).attr('id','node'+ksmid+"_"+already_ksmdid+"_"+already_ksid);
                    $('#node_nameh'+node_id).attr('id','node_nameh'+ksmid+"_"+already_ksmdid+"_"+already_ksid);
                    $('#node_note'+node_id).attr('id','node_note'+ksmid+"_"+already_ksmdid+"_"+already_ksid);
                    $(dblclick_source).attr('id', 'node_name'+ksmid+"_"+already_ksmdid+"_"+already_ksid);            
      
                    //增加端点
                    var ele_add_point = jsPlumb.getSelector('#node'+ksmid+"_"+already_ksmdid+"_"+already_ksid)[0]; 
                    knowledge_map.instance.addEndpoint(ele_add_point, {
                      uuid:ele_add_point.getAttribute('id')+'-bottom',
                      anchor:'Bottom',
                      isSource:true,          
                      maxConnections:-1,
                      overlays:knowledge_map.overlays,
                    });
                    knowledge_map.instance.addEndpoint(ele_add_point, {
                      uuid:ele_add_point.getAttribute('id')+'-top',
                      anchor:'Top',          
                      isTarget:true,
                      maxConnections:1,
                      overlays:knowledge_map.overlays,
                    });
                  
                    //增加连线
                    for(var j=0; j<connector_array_memory.length; j++){
                      var connector_t=connector_array_memory[j];
                      var source_t = connector_t.source;
                      var target_t = connector_t.target;
                      if(source_t==old_node)
                      {
                        knowledge_map.instance.connect({uuids:['node'+ksmid+"_"+already_ksmdid+"_"+already_ksid+'-bottom',connector_t.target+'-top'], overlays:knowledge_map.overlays});
                      }
                      if(target_t==old_node)
                      {
                        knowledge_map.instance.connect({uuids:[connector_t.source+'-bottom','node'+ksmid+"_"+already_ksmdid+"_"+already_ksid+'-top'], overlays:knowledge_map.overlays});
                      }
                    }             
                  }
                }
                if(flag == 0){
                  alert('系统中没有此知识点');
                }else{
                  //flag=1:系统中有此知识点
                  flag = 0; 
                  $( this ).dialog( "close" );               
                }
              }else{
                alert('未输入知识点的名字');
              }                    
            },
            Cancel: function() {
              $( this ).dialog( "close" );            
            }
          },
          close: function() {           
          }
        });
      
      // 关闭我的列表之后，需要destory四个dialog
      $('#closeknowledge_map_list').click(function(){
        $('#dialog-kl').dialog("destroy");
        $('#dialog-form').dialog("destroy");
        $('#dialog-save').dialog("destroy");
        $('#dialog-comment').dialog("destroy");
        $('#dialog-name-modify').dialog("destroy");       
      });

  };
  invoke_proxy(data,success);  
}

// 删除数据库中ksmid的内容
function knowledge_map_js_delKsmid(ksmid, save)
{
	if(save == 1){
		  //保存之前的删除，删除之后需要保存，再refresh
	    var argsdata={"ksmid":ksmid};
	  	var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'delKsmdetailid',args:JSON.stringify(argsdata)};
	  	var success=function(data){
	  	console.log('delKsmdetailid success');
	  		knowledge_map_js_JSONAndUpdate(ksmid, save);
	  	};
	  	invoke_proxy(data,success); 
	}else{
      // 我的列表中的删除
	  	var argsdata={"ksmid":ksmid};
	  	var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'delKsmid',args:JSON.stringify(argsdata)};
	  	var success=function(data){    
	    	console.log('delKsmid success callback');
	      $('#cknowledge_map_list').html();
        $('#dialog-kl').dialog("destroy");
        $('#dialog-form').dialog("destroy");
        $('#dialog-save').dialog("destroy");
        $('#dialog-comment').dialog("destroy");
        $('#dialog-name-modify').dialog("destroy");
        knowledge_map_js_showKnowledgeMapListCode();
	  	};
	  	invoke_proxy(data,success);
	}
}

// 打开新建结构图的基本界面，新建
function knowledge_map_js_newKnowledgeMap(ksmname)
{
  var newklm_time = Date.now();
  var content='';
  content += '<div class="kl_container" style="width:100%; height:435px; margin:0 auto;">';

  content += '<div style=" width:80%; float:left; position:relative">';
  content += '<div class="kl_droppable" id="kl_droppable'+newklm_time+'" style="border: 1px dotted black;height:400px;background-color:white;position:relative;overflow:scroll;"></div>';
  content += '<div class="ta">评论意见：<textarea id="ta'+newklm_time+'" rows="3" cols="20" style="width:80%; margin:0 atuo"></textarea></div>';
  content += '</div>';

  content += '<div style="height:400px; width:20%; float:right; text-align: left;">';
  content += '<ul style="margin: 10px 5px;padding:2px 5px;">';
  content += '<li class="kl_dragsource" style="width: 159px;line-height: 30px;padding: 0 4px;height:20px;background-color:lightgreen;list-style-type: none;display: inline-block;height: 30px;color: white;">新建知识点</li>';
  content += '</ul>';
  content += '<p style="margin-bottom: 10px;padding-left: 9px;"><button type=button id="save'+newklm_time+'"style=" width:50px; height:30px;">保存</button></p>';
  content += '<p style="margin-bottom: 10px;padding-left: 9px;"><button type=button id="save_a'+newklm_time+'"style=" width:50px; height:30px;">另存</button></p>';
  content += '</div></div>';

  $('.knowledge_map').html(content);  

  addTab('showklgMapDetailPage_'+newklm_time,ksmname,content);
  //加载布局，样式等基本的功能，1表示新建
  knowledge_map_js_newKnowledgeMapJs(1, newklm_time);  
}

// 重绘ksmid这个图
function knowledge_map_js_openKnowledgeMap(ksmid, comment)
{
  if($('#tshowklgMapDetailPage_'+ksmid).length > 0){
    console.log('已经有一个了');
  }else{
    var ksmname = knowledge_map.ksmid_ksmname[ksmid];
    var content='';
    content += '<div class="kl_container" style="width:100%; height:435px; margin:0 auto; ">';
    content += '<div style=" width:80%; float:left; position:relative">';
    content += '<div class="kl_droppable" id="kl_droppable'+ksmid+'" style="border: 1px dotted black;height:400px;background-color:white;position:relative;overflow:scroll;"></div>';
    content += '<div class="ta">评论意见：<textarea id="ta'+ksmid+'" rows="3" cols="20" style="width:80%; margin:0 atuo">'+comment+'</textarea></div>';
    content += '</div>';
    content += '<div style="height:400px; width:20%; float:right; text-align: left;">';
    content += '<ul style="margin: 10px 5px;padding:2px 5px;">';
    content += '<li class="kl_dragsource" style="width: 159px;line-height: 30px;padding: 0 4px;height:20px;background-color:lightgreen;list-style-type: none;display: inline-block;height: 30px;color: white;">新建知识点</li>';
    content += '</ul>';
    content += '<ul class="kl_showtab" style="margin: 10px 5px;padding:2px 5px;">';
    content += '<li id="kl_all'+ksmid+'" style="padding: 0 4px;height: 30px;line-height: 30px;width: 159px;margin-bottom: 10px;margin-right: 5px;background-color: lightgreen;list-style-type: none;color:white">显示：全显</li>';
    content += '<li id="kl_ran'+ksmid+'" style="padding: 0 4px;height: 30px;line-height: 30px;width: 159px;margin-bottom: 10px; margin-right: 5px;background-color: lightgreen;list-style-type: none;color:white">显示：随机</li>';
    content += '<li id="kl_only'+ksmid+'" style="padding: 0 4px;height: 30px;line-height: 30px;width: 159px;margin-bottom: 10px;margin-right: 5px;background-color: lightgreen;list-style-type: none;color:white">显示：一个</li>';
    content += '</ul>';
    content += '<p style="margin-bottom: 10px;padding-left: 9px;"><button type=button id="save'+ksmid+'"style=" width:50px; height:30px;">保存</button></p>';
    content += '<p style="margin-bottom: 10px;padding-left: 9px;"><button type=button id="save_a'+ksmid+'"style=" width:50px; height:30px;">另存</button></p>';
    content += '</div></div>';

    $('.knowledge_map').html(content); 
    
    addTab('showklgMapDetailPage_'+ksmid,ksmname,content);   

    //加载布局，样式等基本的功能,2表示重绘
    knowledge_map_js_newKnowledgeMapJs(2, ksmid, ksmname);
    //加载内容。
    knowledge_map_js_getKs(ksmid);
  }
}

//呈现新建结构图界面的第二步。加载很多事件
function knowledge_map_js_newKnowledgeMapJs(sign, ksmid,ksmname){
    knowledge_map.ksmid = ksmid;

    //0表示可以新建节点，1表示不能新建节点，刚开始不能创建。为了防止droppable拖动就会生成一个节点
    var create_sign = 1;   

    //表示双击事件的来源，需要。双击期间不捕获单击事件， 
    var dblclick_source = {};

    //单击事件，捕获删除按键
    var click_sign = 0;
    var click_target = {};   //单击来源
    
    var already_ksid = 0;   //对于系统中已有的知识点，把它的ksid暂存到already_ksid
    knowledge_map.overlays = [
            ['Arrow', {location:.5}, {foldback: .3, fillStyle: 'white', width: 30}],
            ];
    knowledge_map.instance = jsPlumb.getInstance({      
          Connector:['Bezier', {curviness:50}],
          ConnectionOverlays : [
            [ "Arrow", { location:1 } ],
            [ "Label", { 
              location:0.1,
              id:"label",
              cssClass:"aLabel"
            }]
          ],
          DragOptions:{cursor:'pointer', zIndex:2000},
          PaintStyle:{strokeStyle:'lightgreen', lineWidth:3},
          EndpointStyle:{radius:6, fillStyle:'#222'},
          HoverPaintStyle:{strokeStyle:'green'},
          EndpointHoverStyle:{fillStyle:'red'},
          Container:$('.kl_droppable')
        }); 
    
    // 全显
    $('#kl_all'+ksmid).unbind('click');
    $('#kl_all'+ksmid).click(function(){
      knowledge_map_js_showTab(ksmid, 'all');
    });

    // 随机
    $('#kl_ran'+ksmid).unbind('click');
    $('#kl_ran'+ksmid).click(function(){
      knowledge_map_js_showTab(ksmid, 'ran');
    });

    // 一个
    $('#kl_only'+ksmid).unbind('click');
    $('#kl_only'+ksmid).click(function(){
      knowledge_map_js_showTab(ksmid, 'only');
    });

    //可以拖动的元素
    $( ".kl_dragsource" ).draggable({ 
      helper:"clone",  
      containment:"kl_droppable"+ksmid,
      scroll:true,     
      start: function() {
        create_sign = 0;
      },
      stop: function(){
        create_sign = 1;
      }      
    });
      
    // 给容器加click，捕获删除源
    $('.kl_droppable').unbind('click');
    $('.kl_droppable').click(function(e){
        click_sign = 0;
        e = e || window.event;
        click_target = e.target || e.srcElement;
        if($(click_target).attr('id')){
          if($(click_target).attr('id').indexOf('node_name') == 0){
            click_sign = 1;
          }
        }
    });

    // 捕获删除事件
    $(document).unbind('keydown');
    $(document).keydown(function(event){
      if(click_sign == 1){
        if(event.keyCode == 46 ){      
          if($(click_target).attr('id')){
            if($(click_target).attr('id').indexOf('node_name') == 0){
              click_sign = 0;
              var t_id = $(click_target).attr('id').replace('_name','');
              knowledge_map.instance.deleteEndpoint(t_id+'-bottom');
              knowledge_map.instance.deleteEndpoint(t_id+'-top');
              $('#'+t_id).remove();        
              click_target = {};
            }          
          }    
        }
      }      
    }); 

    //可以放置的元素
    $(".kl_droppable").droppable({               
      drop:function(event,ui){
        if(create_sign == 0){
          // 用时间来表示ksmid
          var node_id_t = Date.now();
          $(this).append("<div  class='kl_drag_enter_drop'; id='node"+ksmid+"_"+node_id_t+"_"+node_id_t+"' style='height:40px;color:white;background-color: lightgreen;position:absolute;left:"+ 
          (ui.offset.left-$(this).offset().left)+"px;top:"+(ui.offset.top-$(this).offset().top)+"px'><p class='node_name' style='padding: 0 4px;margin: 0;line-height: 40px;' id='node_name"+ksmid+"_"+node_id_t+"_"+node_id_t+"'>新建知识点</p><p class='node_nameh' style='display:none; padding: 0 4px;margin: 0;line-height: 40px;' id='node_nameh"+ksmid+"_"+node_id_t+"_"+node_id_t+"'>新建知识点</p><p class='node_note' style='display: none;' id='node_note"+ksmid+"_"+node_id_t+"_"+node_id_t+"'></p></div>");
          $('#node'+ksmid+"_"+node_id_t+"_"+node_id_t).css({          
            top: ui.offset.top-$(this).offset().top,
            left: ui.offset.left-$(this).offset().left,
          })         
          
          //给新增的元素添加端点
          knowledge_map_js_addEndPoint(knowledge_map.instance, knowledge_map.overlays, '', 1, '#kl_droppable'+ksmid)          
          create_sign = 1;          
        }       
      } 
    }); 
    
    var dblclick_id = ''; 

    //使用事件代理，给放置容器添加双击事件
    $('#kl_droppable'+ksmid).unbind('dblclick');
    $('#kl_droppable'+ksmid).dblclick(function(e){
        click_sign = 0;    
        e = e || window.event;
        dblclick_source = e.target || e.srcElement;
        if($(dblclick_source).attr('id')){
          if($(dblclick_source).attr('id').indexOf('node_name') == 0){
            knowledge_map.dblclick_source = dblclick_source;
            $( "#dialog-form").dialog("open");
          } 
        }         
    });   

    //自动完成功能
    $( "#name").autocomplete({
      source: knowledge_map.ksname
    });

    //保存后，重画当前的结构图，另存的话，就不重画了。
    //存当前的表
    $('#save'+ksmid).unbind('click');
    $('#save'+ksmid).click(function(){
      knowledge_map.nodes = $('#cshowklgMapDetailPage_'+ksmid+' .kl_drag_enter_drop');
      //sign=1:新建；sigin=2：重画。
      if(sign != 1){
        //重画
        knowledge_map_js_beforeSaveCheck(ksmid);
      }
      else{
        //新建:第三个参数为1，表示这是保存的，最后需要重画
        knowledge_map_js_beforeSaveAnotherCheck($('#tshowklgMapDetailPage_'+ksmid).text().replace('  ×',''), ksmid, 1);
      }
    });    
    
    //另存
    $('#save_a'+ksmid).unbind('click');
    $('#save_a'+ksmid).click(function(){
      knowledge_map.nodes = $('#cshowklgMapDetailPage_'+ksmid+' .kl_drag_enter_drop');
      //
      $( "#dialog-save").dialog("open");                 
    });    
};

//存储新增的ksname：知识点的名字.在dialog中
function knowledge_map_js_saveNewKs(ksname, ksmid, dblclick_source){  
  var argsdata={"userid":knowledge_map.userid, "knowledgeid":1, "courseid":knowledge_map.courseid, "ksname":ksname};
  var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'saveNewKs',args:JSON.stringify(argsdata)};
  var success=function(data){    
    console.log('saveNewKs success callback');
    console.log('saveNewKs:'+data); 
    var save_ksid = data;            
    knowledge_map.ksid.push(save_ksid);
  };
  invoke_proxy(data,success);
}

//显示时的三种模式：全选，随机，一个
function knowledge_map_js_showTab(ksmid, option){
  // 长度为节点的个数。
  var show_nodes_array = [];
  var nodes_show = $('#kl_droppable'+ksmid+' .kl_drag_enter_drop');

  if(option == 'all'){
    for(var i=0; i<nodes_show.length; i++){
      show_nodes_array.push(0);
    }
  }else if(option == 'ran'){
    show_nodes_array = knowledge_map_js_getRandom(nodes_show.length);
  }else{
    for(var i=0; i<nodes_show.length; i++){
      show_nodes_array.push(0);
    }
    var ran_t = Math.ceil(nodes_show.length*Math.random());
    show_nodes_array[ran_t] = 1;
  }  

  for(var i=0; i<show_nodes_array.length; i++){
    // 如果是根节点
    if($(nodes_show[i]).attr('id') == 'node'+ksmid+'_'+knowledge_map.rootid){
      $(nodes_show[i]).find('.node_name').text($(nodes_show[i]).find('.node_nameh').text());
    }else{
      // 如果不是根节点
      if(show_nodes_array[i] == 0){
        $(nodes_show[i]).find('.node_name').text($(nodes_show[i]).find('.node_nameh').text());
      }else{
        var w_t = $(nodes_show[i]).css('width');
        $(nodes_show[i]).find('.node_name').text('???');
        $(nodes_show[i]).css('width', w_t);
      }
    }    
  }
}

//给新增的元素增加链接端点，加连线
function knowledge_map_js_addEndPoint(instance, overlays, connectors, only, selector){ 
    var ele_add_point = {};
    instance.doWhileSuspended(function(){
      if(only == 1){
        ele_add_point = jsPlumb.getSelector(selector+' .kl_drag_enter_drop').last();        
      }else{
        ele_add_point = jsPlumb.getSelector(selector+' .kl_drag_enter_drop');        
      }
      
      for(var i = 0; i<ele_add_point.length;i++){
        instance.addEndpoint(ele_add_point[i], {
          uuid:ele_add_point[i].getAttribute('id')+'-bottom',
          anchor:'Bottom',
          isSource:true,          
          maxConnections:-1,
          overlays:overlays,
        });
        instance.addEndpoint(ele_add_point[i], {
          uuid:ele_add_point[i].getAttribute('id')+'-top',
          anchor:'Top',          
          isTarget:true,
          maxConnections:1,
          overlays:overlays,
        });
      }

      if(only != 1){
        for(var i = 0; i<connectors.length; i++){
          var c = instance.connect({uuids:[connectors[i].source+'-bottom',connectors[i].target+'-top'], overlays:overlays});          
        }
      }
    });
    if(only == 1){
        ele_add_point = jsPlumb.getSelector('.kl_drag_enter_drop');        
      }else{
        ele_add_point = jsPlumb.getSelector(selector+' .kl_drag_enter_drop');
      }
    instance.draggable(ele_add_point);
    jsPlumb.fire('jsPlumbdemoLoaded', instance);      
};

//保存之前进行的检查
function knowledge_map_js_beforeSaveCheck(ksmid)
{  
  //需要检测的内容：1、节点个数>2; 2、每个节点都有一个父节点，一棵树只有一个根节点，top只能为target；bottom只能为source。检测成功后，是没有环路的。
  var connector_length = knowledge_map.instance.getConnections().length;
  //节点个数至少为2
  if($('.kl_drag_enter_drop').length > 1){
    if(knowledge_map_js_eachHasParent() == 1){
      //检查2通过
      console.log('每个节点都有父节点');
      knowledge_map_js_delKsmid(ksmid, 1);
    }    
  }else{
     console.log('节点个数为：'+$('.kl_drag_enter_drop').length);
     alert('知识点个数至少为2。');
  }  
}

//另存之前进行的检查
function knowledge_map_js_beforeSaveAnotherCheck(ksmname, ksmid, save)
{  
  //需要检测的内容：1、节点个数>2; 2、每个节点都有一个父节点，一棵树只有一个根节点，top只能为target；bottom只能为source。检测成功后，是没有环路的。
  var connector_length = knowledge_map.instance.getConnections().length;
  //节点个数至少为2
  if($('.kl_drag_enter_drop').length > 1){
    if(knowledge_map_js_eachHasParent() == 1){
      //检查2通过
      console.log('每个节点都有父节点');
      //新建的，直接保存
      knowledge_map_js_JSONAndSave(ksmid, ksmname, save);   
    }    
  }else{
     console.log('节点个数为：'+$('.kl_drag_enter_drop').length);
     alert('知识点个数至少为2。');
  }  
}

//检测每个节点都有父节点
function knowledge_map_js_eachHasParent(){
  //nodes_pid存储每个节点的父节点
  //保存之前需要处理的nodes and connectors_array   
  var connector_array = knowledge_map.instance.getConnections();
  for(var i=0; i<connector_array.length; i++){
    var connector_t = connector_array[i];
    var source_t = connector_t.source;
    var target_t = connector_t.target;
    var source_index =  knowledge_map_js_idToIndex(source_t.attr('id'));
    var target_index =  knowledge_map_js_idToIndex(target_t.attr('id'));    
    if(source_index == target_index){
      console.log('出现了自连接');
      return 0;
    }
    knowledge_map.nodes_pid[target_index] = source_t.attr('id');    
  }
  //处理根节点：1、找到根节点:如果只有一个，则成功
  var root_id = 0;
  knowledge_map.nodes = $('#kl_droppable'+knowledge_map.ksmid+' .kl_drag_enter_drop');
  
  // console.log('节点个数:'+knowledge_map.nodes.length);
  // console.log('根节点个数:'+knowledge_map.nodes_pid.length);
  
  for(var i=0; i<knowledge_map.nodes.length; i++){
    if(!knowledge_map.nodes_pid[i]){      
        knowledge_map.nodes_pid[i] = -1;
        root_id++;      
    }    
  }
	// console.log('root_id:'+root_id);
  if(root_id != 1){
    console.log('根节点有问题，或者没有根节点，或者有多个根节点');
    root_id = 0;
    return 0;
  }else{
    root_id = 0;
    return 1;
  }
}

//根据节点的id找节点的序号，在knowledge_map.nodes中
function knowledge_map_js_idToIndex(id){
  var result = -1;
  for(var i=0; i<knowledge_map.nodes.length; i++){
    if(id == $(knowledge_map.nodes[i]).attr('id')){      
      result = i;
      break;
    }
  }
  return result;
}

// 检查符合要求后，进行保存前的json整理和保存
function knowledge_map_js_JSONAndSave(ksmid, ksmname, save)  //JSONAndSave
{   
  //将要发送的json对象
  var argsdata={};
  argsdata.userid = 1;
  argsdata.courseid = 1;
  argsdata.score = 1;     //与标准树进行比较之后，再计算
  argsdata.comment = $('#ta'+ksmid).val();
  argsdata.ksmname = ksmname;
  argsdata.child = [];   
  
  //构建argsdata的child数组
  for(var i = 0; i<knowledge_map.nodes.length; i++){
    var node = {};
    node.ksmid = ksmid;
    node.ksmdid = (+$(knowledge_map.nodes[i]).attr('id').replace('node','').split('_')[1]);
    node.ksid = (+$(knowledge_map.nodes[i]).attr('id').replace('node','').split('_')[2]);
    node.label = $(knowledge_map.nodes[i]).find('.node_nameh').text().replace(' ','');
    node.note = $(knowledge_map.nodes[i]).find('.node_note').text().replace(' ','');   
    node.top4= +$(knowledge_map.nodes[i]).css('top').replace('px',''); 
    node.left4= +$(knowledge_map.nodes[i]).css('left').replace('px','');    
    var t = knowledge_map.nodes_pid[i];   
    if(knowledge_map.nodes_pid[i] == -1){
      node.ksmdidparent = 0;
    }else{
      node.ksmdidparent = +knowledge_map.nodes_pid[i].replace('node', '').split('_')[1];
    }    
    argsdata.child.push(node);
  };
  console.log('argsdata:'+JSON.stringify(argsdata));

  knowledge_map.nodes_pid = [];

  var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'saveKLM',args:JSON.stringify(argsdata)};
  var success=function(data){    
    console.log('save success');
    $('#cknowledge_map_list').html();
    //保存之后，更新table
    $('#dialog-kl').dialog("destroy");
    $('#dialog-form').dialog("destroy");
    $('#dialog-save').dialog("destroy");
    $('#dialog-comment').dialog("destroy");
    $('#dialog-name-modify').dialog("destroy");
    knowledge_map_js_showKnowledgeMapListCode();
          
    //新建的保存，然后关掉，再打开。      
    if(save == 1){        
       $("#tabul li").removeClass("tab-ctab");
        hideAllFirstLevleChildren('tabcontent');
        var tabId = 'showklgMapDetailPage_'+ksmid;
        $("#close"+tabId).parent().prev().addClass("tab-ctab");
        $("#c"+tabId).prev().fadeIn('slow');          
        $("#close"+tabId).parent().remove();
        $("#c"+tabId).remove();
        console.log('859 new save open retu:'+data);
        
        knowledge_map_js_openKnowledgeMap(data, argsdata.comment);
    }         
  };
  invoke_proxy(data,success); 
}

function knowledge_map_js_JSONAndUpdate(ksmid, save)  //JSONAndSave
{   
  //将要发送的json对象
  console.log("knowledge_map_js_JSONAndUpdate");
  var argsdata={};
  // 更新ksm时需要ksmid
  argsdata.ksmid=ksmid;     
  argsdata.userid = 1;
  argsdata.courseid = 1;
  argsdata.score = 1;     //与标准树进行比较之后，再计算
  argsdata.comment = $('#ta'+ksmid).val();
  argsdata.ksmname = $('#tshowklgMapDetailPage_'+ksmid).text().replace('  ×','');
  argsdata.child = [];   
  
  //构建argsdata的child数组
  for(var i = 0; i<knowledge_map.nodes.length; i++){
    var node = {};
    node.ksmid = ksmid;
    node.ksmdid = (+$(knowledge_map.nodes[i]).attr('id').replace('node','').split('_')[1]);
    node.ksid = (+$(knowledge_map.nodes[i]).attr('id').replace('node','').split('_')[2]);
    node.label = $(knowledge_map.nodes[i]).find('.node_nameh').text().replace(' ','');
    node.note = $(knowledge_map.nodes[i]).find('.node_note').text().replace(' ','');   
    node.top4= +$(knowledge_map.nodes[i]).css('top').replace('px',''); 
    node.left4= +$(knowledge_map.nodes[i]).css('left').replace('px','');    
    var t = knowledge_map.nodes_pid[i];   
    if(knowledge_map.nodes_pid[i] == -1){
      node.ksmdidparent = 0;
    }else{
      node.ksmdidparent = +knowledge_map.nodes_pid[i].replace('node', '').split('_')[1];
    }    
    argsdata.child.push(node);
  };
  console.log('argsdata:'+JSON.stringify(argsdata));

  knowledge_map.nodes_pid = [];

  var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'updateKLM',args:JSON.stringify(argsdata)};
  var success=function(data){    
    console.log('save success');
    //保存之后，更新table
    $('#cknowledge_map_list').html();
    $('#dialog-kl').dialog("destroy");
    $('#dialog-form').dialog("destroy");
    $('#dialog-save').dialog("destroy");
    $('#dialog-comment').dialog("destroy");
    $('#dialog-name-modify').dialog("destroy");
    knowledge_map_js_showKnowledgeMapListCode();
    
    //重画的保存，把当前结构图重画
    //save=1:重画
    if(save == 1){
      $('#kl_droppable'+ksmid).html('');
      knowledge_map_js_newKnowledgeMapJs(2, ksmid, argsdata.ksmname);
      knowledge_map_js_getKs(ksmid);
    }        
  };
  invoke_proxy(data,success); 
}

//获得知识点的相关信息：ksid,ksidparent,ksname,note
function knowledge_map_js_getKs(ksmid)
{
  var argsdata={"ksmid":ksmid};
  var data={clazz:'com.exam.action.proxy.student.knowledgemap.KnowledgeMapProxy',service:'getKs',args:JSON.stringify(argsdata)};
  var success=function(data){
    console.log('getKs success callback');
    //ksid, ksidparent, label, note, ksmdid,top4,left4
    console.log('getKs:'+data);
    var ks = data;
    var content = "";
    var connectors = [];

    for(var i =0; i<ks.length; i++){      
      if(ks[i][1] != 0){
        var connector = {};
        var k=0;
        for(var j=0;j<ks.length;j++)
        {
        	if(ks[i][1]==ks[j][0])
        	{
        		k=j;
        	}
        }
        connector.source = 'node'+ksmid+"_"+ks[k][4]+"_"+ks[i][1];
        connector.target = 'node'+ksmid+"_"+ks[i][4]+"_"+ks[i][0];
        connectors.push(connector);
      }
    }

    knowledge_map.connectors = connectors;

    for(var i =0; i<ks.length; i++){
    	if(ks[i][1] == 0){
    		knowledge_map.rootid = ks[i][4]+"_"+ks[i][0];
    	}
      content += "<div  class='kl_drag_enter_drop'; id='node"+ksmid+"_"+ks[i][4]+"_"+ks[i][0]+"' style='height:40px; background-color: lightgreen; color:white;position:absolute;left:"+ks[i][6]+"px;top:"+ks[i][5]+"px'><p class='node_name' style='margin: 0; line-height: 40px;  padding:0 4px;' id='node_name"+ksmid+"_"+ks[i][4]+"_"+ks[i][0]+"'>"+ks[i][2]+"</p><p class='node_nameh' style='display:none; margin: 0; line-height: 40px; display: none;' id='node_nameh"+ksmid+"_"+ks[i][4]+"_"+ks[i][0]+"'>"+ks[i][2]+"</p><p class='node_note' style='display: none;' id='node_note"+ksmid+"_"+ks[i][4]+"_"+ks[i][0]+"'>"+ks[i][3]+"</p></div>";      
    }
    $(content).appendTo($('#kl_droppable'+ksmid));
    // 节点加载完之后，调用随机函数
    knowledge_map_js_showTab(ksmid, 'ran');
    knowledge_map_js_addEndPoint(knowledge_map.instance, knowledge_map.overlays, connectors, 0, '#kl_droppable'+ksmid);     
  };
  invoke_proxy(data,success);
}

/**
 * 生成数组,一半是0 show，一半是1 hide
 * @param 10
 * @return 
 */
function knowledge_map_js_getRandom(max){
  var result = [];
  var num_0 = Math.ceil(max/2);
  var num_1 = max-num_0;
  for(var i=0; i<num_0; i++){
    result.push(0);
  }
  for(var i=0; i<num_1; i++){
    result.push(1);
  }
  result.sort(function(a,b){  
    return Math.random()>.5 ? -1 : 1;  
  });   
  return result;
};





