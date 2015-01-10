var knowledge_map = {
  userid : 0,
  courseid : 0,
  ksname : [],              //存储userid本身和0的ksname，为了autocomplete用
  ksid : [],                //添加了系统已有的节点后，需要用到的ksid
  instance : {},
  overlays : [],
  connectors : [],          //结构图中的连线
  rootid : '',               //根节点
  nodes_pid : [],           //存储节点的父节点，key为target_index，value为sourceid
  nodes : [],               //结构图中的节点
  dblclick_source : {},     //当前处理的双击源，把dialog做成全局的需要
  ksmid : ''           //当前处理的结构图的id，把dialog做成全局的需要
};

//点击我的列表之后呈现列表的代码

function knowledge_map_js_showKnowledgeMapList(){
  //呈现我的列表需要初始化的信息
  knowledge_map.userid = 1;
  knowledge_map.courseid = 1;
  knowledge_map.ksname = [],              //存储userid本身和0的ksname，为了autocomplete用
  knowledge_map.ksid = [],                //添加了系统已有的节点后，需要用到的ksid
  knowledge_map.instance = {},
  knowledge_map.overlays = [],
  knowledge_map.connectors = [],          //结构图中的连线
  knowledge_map.rootid = '',   
  knowledge_map.nodes_pid = [];
  knowledge_map.nodes = [];

  var tabTempName = '我的列表';    
  var content=''; 

  content+="<table class='AJAX_TABLE_ID' cellspacing='0' ><thead><tr><th scope=col>标识</th><th scope=col>名称</th><th scope=col>删除</th><th scope=col>得分</th><th scope=col>评论意见</th></tr></thead>";
  content+="<tbody>";
  content+="<tr><img height=29px width=29px src='images/klm/processing.gif'></img>&nbsp;数据正在加载请稍候...</tr>"
  content+='</tbody></table>';
  content+='<div id="knowledge_map_list_pagination" class="pagination">';
  content+='</div>';
  addTab('knowledge_map_list',tabTempName,content);

  $.ajax({
    type:"GET",
    async:true,
    cache: false,
    dataType:"json",
    url:"/klm/getKsnameAll",
    data:{},   
    success:function(rdata, textStatus, XMLHttpRequest)
    {
      //ksname, ksid
      console.log('getKsname 返回成功');
      // console.log('getKsname:'+JSON.stringify(rdata));

      for(var i=0; i<rdata.length; i++){      
        knowledge_map.ksid.push(rdata[i]._id);
        knowledge_map.ksname.push(rdata[i].ksname);
      }  

      // console.log('ksname:'+knowledge_map.ksname);     
      // console.log('ksid:'+knowledge_map.ksid);     

      knowledge_map_js_showKnowledgeMapListCode();
    }
  });
}

//获取我的列表中每条记录的信息，并加载代码
function knowledge_map_js_showKnowledgeMapListCode(){
  $.ajax({
    type:"GET",
    async:true,
    cache: false,
    dataType:"json",
    url:"/klm/getKsmInfo",
    data:{},   
    success:function(data, textStatus, XMLHttpRequest)
    {
      //"_id":"54ab8bab16a937682e9f2655","comment":"","score":100,"ksmname":"test1" 
      console.log('getKsmInfo 返回成功');
      //console.log('getKsname:'+rdata);

      var content='';
      content+="<button id='new_kl'>新建</button>";

      //另存对话框
      content += '<div id="dialog-save" title="另存" style="font-size: 100%;">';
      content += '<form style="margin:0;">';
      content += '<fieldset style="padding:0; border:0; margin-top:25px;"><label for="name">名字:</label>';
      content += '<input type="text" name="kl_save_name" id="kl_save_name" style="margin-bottom:12px; width:70%; padding: .4em;" class="text ui-widget-content ui-corner-all">';
      content += '</fieldset>';  
      content += '</form></div>';
      
      //创建知识点的对话框
      content += '<div id="dialog-form" title="创建新知识点" style="font-size: 100%;">';
      content += '<p class="validateTips">所有的表单字段都是必填的。</p>';
      content += '<form>';
      content += '<fieldset style="padding:0; border:0; margin-top:25px;">';
      content += '<label for="name">名字:</label>';
      content += '<input type="text" name="name" style="margin-bottom:12px; width:70%; padding: .4em;" id="name" class="text ui-widget-content ui-corner-all">';
      content += '<button type="button" name="add_node" id="add_node">新增</button>';
      content += '</fieldset>';
      content += '<fieldset style="padding:0; border:0; margin-top:25px;">';
      content += '<label for="note" class="note_label">笔记:</label>';
      content += '<textarea rows="3" cols="20" name="note" id="dialog_note" style="width: 80%;height: 100%;vertical-align: top;resize: none;" class="note text ui-widget-content ui-corner-all"> </textarea>';
      content += '</fieldset></form></div>';

      //评论意见对话框
      content += '<div id="dialog-comment" title="评论意见" style="font-size: 100%%;">';
      content += '<form style="margin:0;">';
      content += '<fieldset style="padding:0; border:0; margin-top:25px;">';
      content += '<label for="dialog_comment_t">评论意见:</label>';
      content += '<textarea disabled="disabled" rows="3" cols="20" name="dialog_comment_t" id="dialog_comment_t" style="width: 80%;height: 20%;vertical-align: top;resize: none;" class="text ui-widget-content ui-corner-all"> </textarea>';
      content += '</fieldset>';  
      content += '</form></div>';
      //新建结构图对话框
      content += '<div id="dialog-kl" title="创建新结构图" style="font-size: 100%;">';
      content += '<form style="margin:0;">';
      content += '<fieldset style="padding:0; border:0; margin-top:25px;"><label for="name">名字:</label>';
      content += '<input type="text" name="name" id="kl_name" style="margin-bottom:12px; width:70%; padding: .4em;" class="text ui-widget-content ui-corner-all">';
      content += '</fieldset>';  
      content += '</form></div>';
      content+="<table class='AJAX_TABLE_ID' cellspacing='0' ><thead><tr><th scope=col>标识</th><th scope=col>名称</th><th scope=col>删除</th><th scope=col>得分</th><th scope=col>评论意见</th></tr></thead>";
      content+="<tbody>";

      if(data.length != 0){
        for(var i=0; i<data.length; i++){      
          content+="<tr>";
          var tema="<a title='打开' href='javascript:;' onclick='knowledge_map_js_openKnowledgeMap(\" "+data[i].ksmname+"\", \""+data[i]._id+"\", \""+data[i].comment+"\")'>打开</a>";
          content+=("<td>"+ tema +"</td>");                  
          content+=("<td>"+data[i].ksmname+"</td>");
          tema="<a title='删除' href='javascript:;' onclick='knowledge_map_js_delKsmid(\""+data[i]._id+"\",0)'>删除</a>";  
          content+=("<td>"+ tema +"</td>");        
          content+=("<td>"+ (data[i].score) +"</td>"); 
          if(data[i].comment){
            if(data[i].comment.length < 22){
              content+=("<td><p class='list_comment' style='line-height: 33px;margin:0;padding:0 4px;'>"+data[i].comment+"</p><p style='display:none'>"+data[i].comment+"</p></td>");
            }else{
              content+=("<td><p class='list_comment' style='line-height: 33px;margin:0;padding:0 4px;'>"+data[i].comment.substring(0,21)+"</p><p style='display:none'>"+data[i].comment+"</p></td>");
            }
          }      
          
          content+="</tr>";
        }
      }else{
        content+="<tr>";
        content+=("<td colspan='100%' align='center'>暂时没有数据</td>");
        content+="</tr>";
      }    
      content+='</tbody></table>';
      $('#cknowledge_map_list').html(content); 

      //新增节点名称
      $('#add_node').click(function(){      
        //save ksmknowledge
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


      //局部变量就够用，列表中双击评论时的事件源。这样做的好处是不用加id
      var click_target_list = {};
      $('.list_comment').dblclick(function(e){
          e = e || window.event;
          click_target_list = e.target || e.srcElement;
          $( "#dialog-comment").dialog( "open" );
      });

      $("#dialog-comment").dialog({      
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        open: function() {
          $(this).bind("keypress.ui-dialog", function(event){
            if(event.keyCode == $.ui.keyCode.ENTER){
              console.log('enter');
              return false;
            }
          });
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
          open: function() {
            $(this).bind("keypress.ui-dialog", function(event){
              if(event.keyCode == $.ui.keyCode.ENTER){
                console.log('enter');
                return false;
              }
            });
            $("#kl_name").val('结构图的名字'); 
             },        
          buttons: {          
            "确定": function() {
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
      
      $("#dialog-save").dialog({      
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        open: function() {
          $(this).bind("keypress.ui-dialog", function(event){
            if(event.keyCode == $.ui.keyCode.ENTER){
              console.log('enter');
              return false;
            }
          });
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

      //节点 对话框的事件
      //$("#dialog-form"+ksmid).dialog({
      $("#dialog-form").dialog({      
          autoOpen: false,
          height: 300,
          width: 350,
          modal: true,
          open: function() {
            $(this).bind("keypress.ui-dialog", function(event){
              if(event.keyCode == $.ui.keyCode.ENTER){
                console.log('enter');
                return false;
              }
            });
            var dblclick_source = knowledge_map.dblclick_source;
            $("#name").val($(dblclick_source).text());
            $('#dialog_note').val($('#'+$(dblclick_source).attr('id').replace('node_name','node_note')).text());            
             },
          buttons: {                     
            "确定": function() {           
              if($("#name").val() != ''){
                var flag = 0;
                //有知识点的名字
                //从系统中选择知识点，需要更改id
                for(var i=0; i<knowledge_map.ksname.length; i++){
                  if(knowledge_map.ksname[i] == $("#name").val()){
                    flag = 1;

                    //把对话框中的内容赋给节点
                    var dblclick_source = knowledge_map.dblclick_source;
                    var ksmid = knowledge_map.ksmid; 
                    $(dblclick_source).text($("#name").val());
                    var nodeh_id = $(dblclick_source).attr('id').replace('node_name','node_nameh');
                    $('#'+nodeh_id).text($("#name").val());             
                    var node_note_id = $(dblclick_source).attr('id').replace('node_name','node_note');
                    $('#'+node_note_id).text($('#dialog_note').val());

                    var already_ksid = knowledge_map.ksid[i];                       
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
      
                    //add endpoint
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
                //文本框中没输入内容
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
      
      $('#closeknowledge_map_list').click(function(){
        $('#dialog-kl').dialog("destroy");
        $('#dialog-form').dialog("destroy");
        $('#dialog-save').dialog("destroy");
        $('#dialog-comment').dialog("destroy");
      });
    }
  });   
}

//删除数据库中ksmid的内容
function knowledge_map_js_delKsmid(ksmid, save)
{
	if(save == 1){
   //sign=2(重画)，save=1(存储前的删除):删除ksmdetails，更新ksm		
   $.ajax({
    type:"GET",
    async:true,
    cache: false,    
    dataType:"text", 
    contentType: "application/json; charset=utf-8",  
    url:"/klm/delKsmdetailid",
    data:{"ksmid":ksmid},    
    success:function(rdata, textStatus, XMLHttpRequest)
    {
      console.log('delKsmdetailid 返回成功');
      // console.log('delKsmdetailid:'+rdata);
      knowledge_map_js_JSONAndUpdate(ksmid, save);                
    }    
   }); 
	}else{
    //列表中的删除
    //save=0,删除ksmdetails和ksm
    $.ajax({
    type:"GET",
    async:true,
    cache: false,    
    dataType:"text", 
    contentType: "application/json; charset=utf-8",  
    url:"/klm/delKsmid",
    data:{"ksmid":ksmid},    
    success:function(rdata, textStatus, XMLHttpRequest)
    {
      console.log('delKsmid 返回成功');
      $('#cknowledge_map_list').html();
      $('#dialog-kl').dialog("destroy");
      $('#dialog-form').dialog("destroy");
      $('#dialog-save').dialog("destroy");
      $('#dialog-comment').dialog("destroy");
      knowledge_map_js_showKnowledgeMapListCode();            
    }       
   }); 
	}
}

// //打开新建结构图的基本界面，新建
function knowledge_map_js_newKnowledgeMap(ksmname)
{
  var newklm_time = Date.now();
  var content='';
  content += '<div class="kl_container" style="width:100%; margin:0 auto;">';

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

// //重绘ksmid这个图
function knowledge_map_js_openKnowledgeMap(ksmname, ksmid, comment)
{
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

//呈现新建结构图界面的第二步。加载很多事件
function knowledge_map_js_newKnowledgeMapJs(sign, ksmid, ksmname){
    knowledge_map.ksmid = ksmid;
    var create_sign = 1;   //0表示可以新建节点，1表示不能新建节点，刚开始不能创建。为了防止droppable拖动就会生成一个节点

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
    
    $('#kl_all'+ksmid).unbind('click');
    $('#kl_all'+ksmid).click(function(){
      knowledge_map_js_showTab(ksmid, 'all');
    });

    $('#kl_ran'+ksmid).unbind('click');
    $('#kl_ran'+ksmid).click(function(){
      knowledge_map_js_showTab(ksmid, 'ran');
    });

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
    });    kl_save_name
    
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
  $.ajax({
    type:"POST",
    async:true,
    cache: false,
    dataType:"json",
    url:"/klm/saveNewKs",
    data:{"ksname":ksname},   
    success:function(data, textStatus, XMLHttpRequest)
    {
      //ksid
      console.log('saveNewKs 返回成功');      
      var save_ksid = data.ksid;  
      knowledge_map.ksid.push(save_ksid);
    }
  });
}

//显示时的三种模式：全选，随机，一个
function knowledge_map_js_showTab(ksmid, option){
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
    if($(nodes_show[i]).attr('id') == 'node'+ksmid+'_'+knowledge_map.rootid){
      $(nodes_show[i]).find('.node_name').text($(nodes_show[i]).find('.node_nameh').text());
    }else{
      if(show_nodes_array[i] == 0){
        $(nodes_show[i]).find('.node_name').text($(nodes_show[i]).find('.node_nameh').text());
      }else{
        $(nodes_show[i]).find('.node_name').text('???');
      }
    }    
  }
}

//给新增的元素增加链接端点
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
  if($('#kl_droppable'+ksmid+' .kl_drag_enter_drop').length > 1){
    if(knowledge_map_js_eachHasParent(ksmid) == 1){
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
  if($('#kl_droppable'+ksmid+' .kl_drag_enter_drop').length > 1){
    if(knowledge_map_js_eachHasParent(ksmid) == 1){
      //检查2通过
      console.log('每个节点都有父节点');
      //save=1:保存后需要重画
      knowledge_map_js_JSONAndSave(ksmid, ksmname, save);   
    }    
  }else{
     console.log('节点个数为：'+$('.kl_drag_enter_drop').length);
     alert('知识点个数至少为2。');
  }  
}

//检测每个节点都有父节点
function knowledge_map_js_eachHasParent(ksmid){
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
    
    //之所以不使用数组，是因为现在还处于检测状态，等存储之前再用数组表示
    knowledge_map.nodes_pid[target_index] = source_t.attr('id');    
  }
  //处理根节点：1、找到根节点:如果只有一个，则成功
  var root_id = 0;

  knowledge_map.nodes = $('#kl_droppable'+ksmid+' .kl_drag_enter_drop');
  for(var i=0; i<knowledge_map.nodes.length; i++){
    if(!knowledge_map.nodes_pid[i]){      
        knowledge_map.nodes_pid[i] = -1;
        root_id++;      
    }    
  }
  console.log('保存 根节点个数：'+root_id);

  if(root_id != 1){
    console.log('根节点有问题，或者没有根节点，或者有多个根节点');
    root_id = 0;
    return 0;
  }else{
    root_id = 0;
    return 1;
  }
}

//根据节点的id找节点的序号
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
  //完全保存，ksm和ksmdetails 
  //将要发送的json对象
  var argsdata={};  
  argsdata.score = 1;     
  argsdata.comment = $('#ta'+ksmid).val();
  argsdata.ksmname = ksmname;
  argsdata.child = [];   
  
  //构建argsdata的child数组
  for(var i = 0; i<knowledge_map.nodes.length; i++){
    var node = {};
    node.ksmid = ksmid;
    node.ksid = ($(knowledge_map.nodes[i]).attr('id').replace('node','').split('_')[2]);
    node.label = $(knowledge_map.nodes[i]).find('.node_nameh').text().replace(' ','');
    node.note = $(knowledge_map.nodes[i]).find('.node_note').text().replace(' ','');   
    node.top4= +$(knowledge_map.nodes[i]).css('top').replace('px',''); 
    node.left4= +$(knowledge_map.nodes[i]).css('left').replace('px','');    
    var t = knowledge_map.nodes_pid[i];   
    if(knowledge_map.nodes_pid[i] == -1){
      node.ksidparent = 0;
    }else{
      node.ksidparent = knowledge_map.nodes_pid[i].replace('node', '').split('_')[2];
    }    
    argsdata.child.push(node);
  };

  argsdata = JSON.stringify(argsdata);
  console.log('argsdata:'+argsdata);

  knowledge_map.nodes_pid = [];

  $.ajax({
    type:"POST",
    async:true,
    cache: false,    
    dataType:"text", 
    contentType: "application/json; charset=utf-8",  
    url:"/klm/saveKLM",
    data:argsdata,    
    success:function(rdata, textStatus, XMLHttpRequest)
    {
      console.log('saveKLM');
      // console.log('saveKLM:'+rdata);
      $('#cknowledge_map_list').html();
      $('#dialog-kl').dialog("destroy");
      $('#dialog-form').dialog("destroy");
      $('#dialog-save').dialog("destroy");
      $('#dialog-comment').dialog("destroy");
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
          
          knowledge_map_js_openKnowledgeMap(rdata.split('_')[1], rdata.split('_')[0], rdata.split('_')[2])
      }
                 
    }    
  });  
}

function knowledge_map_js_JSONAndUpdate(ksmid, save)  
{
  //不完全保存，更新ksm，插入ksmdetails
  //将要发送的json对象
  var argsdata={};
  //更新的时候需要ksmid，其他的存储不需要
  argsdata.ksmid=ksmid;  
  argsdata.score = 1;     
  argsdata.comment = $('#ta'+ksmid).val();
  argsdata.ksmname = $('#tshowklgMapDetailPage_'+ksmid).text().replace('  ×','');
  argsdata.child = [];   

  //构建argsdata的child数组
  for(var i = 0; i<knowledge_map.nodes.length; i++){
    var node = {};
    node.ksmid = ksmid;
    node.ksid = ($(knowledge_map.nodes[i]).attr('id').replace('node','').split('_')[2]);
    node.label = $(knowledge_map.nodes[i]).find('.node_nameh').text().replace(' ','');
    node.note = $(knowledge_map.nodes[i]).find('.node_note').text().replace(' ','');   
    node.top4= +$(knowledge_map.nodes[i]).css('top').replace('px',''); 
    node.left4= +$(knowledge_map.nodes[i]).css('left').replace('px','');    
    var t = knowledge_map.nodes_pid[i];   
    if(knowledge_map.nodes_pid[i] == -1){
      node.ksidparent = 0;
    }else{
      node.ksidparent = knowledge_map.nodes_pid[i].replace('node', '').split('_')[2];
    }    
    argsdata.child.push(node);
  };

  argsdata = JSON.stringify(argsdata);
  console.log('argsdata:'+argsdata);

  knowledge_map.nodes_pid = [];

  $.ajax({
    type:"POST",
    async:true,
    cache: false,    
    dataType:"text", 
    contentType: "application/json; charset=utf-8",  
    url:"/klm/updateKLM",
    data:argsdata,    
    success:function(rdata, textStatus, XMLHttpRequest)
    {
      console.log('saveKLM');
      // console.log('saveKLM:'+rdata);
      $('#cknowledge_map_list').html();
      $('#dialog-kl').dialog("destroy");
      $('#dialog-form').dialog("destroy");
      $('#dialog-save').dialog("destroy");
      $('#dialog-comment').dialog("destroy");
      knowledge_map_js_showKnowledgeMapListCode();

      //重画的保存，把当前结构图重画
      //save=1:重画
      if(save == 1){
        $('#kl_droppable'+ksmid).html('');
        knowledge_map_js_newKnowledgeMapJs(2, ksmid, argsdata.ksmname);
        knowledge_map_js_getKs(ksmid);
      }
    }    
  });
}

//获得节点的相关信息：ksid,ksidparent,ksname,note
function knowledge_map_js_getKs(ksmid)
{
  $.ajax({
    type:"GET",
    async:true,
    cache: false,
    dataType:"json",
    url:"/klm/getKs",
    data:{"ksmid":ksmid},   
    success:function(data, textStatus, XMLHttpRequest)
    {
      //_id,ksid,ksidparent,label,note,top4,left4
      console.log('getKs 返回成功');
      // console.log('getKs:'+JSON.stringify(data));      
      var content = "";
      //用来存储线的source和target，这是作为start.connectors的一部分
      var connectors = [];
      var show_hide = knowledge_map_js_getRandom(data.length);
      for(var i =0; i<data.length; i++){      
        if(data[i].ksidparent != 0){
          var connector = {};
          var k=0;
          for(var j=0;j<data.length;j++)
          {
            if(data[i].ksidparent==data[j].ksid)
            {
              k=j;
            }
          }
          connector.source = 'node'+ksmid+"_"+data[k]._id+"_"+data[i].ksidparent;
          connector.target = 'node'+ksmid+"_"+data[i]._id+"_"+data[i].ksid;
          // console.log('source:'+connector.source);
          // console.log('target:'+connector.target);
          connectors.push(connector);
        }
      }

      knowledge_map.connectors = connectors;
      for(var i =0; i<data.length; i++){
        if(data[i].ksidparent == 0){
          knowledge_map.rootid = data[i]._id+'_'+data[i].ksid;
        }
        content += "<div  class='kl_drag_enter_drop'; id='node"+ksmid+"_"+data[i]._id+"_"+data[i].ksid+"' style='height:40px; background-color: lightgreen; color:white;position:absolute;left:"+data[i].left4+"px;top:"+data[i].top4+"px'><p class='node_name' style='margin: 0; line-height: 40px;  padding:0 4px;' id='node_name"+ksmid+"_"+data[i]._id+"_"+data[i].ksid+"'>"+data[i].label+"</p><p class='node_nameh' style='display:none; margin: 0; line-height: 40px; display: none;' id='node_nameh"+ksmid+"_"+data[i]._id+"_"+data[i].ksid+"'>"+data[i].label+"</p><p class='node_note' style='display: none;' id='node_note"+ksmid+"_"+data[i]._id+"_"+data[i].ksid+"'>"+data[i].note+"</p></div>";      
      }
      $(content).appendTo($('#kl_droppable'+ksmid));
      knowledge_map_js_addEndPoint(knowledge_map.instance, knowledge_map.overlays, connectors, 0, '#kl_droppable'+ksmid);  
    }
  });
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





