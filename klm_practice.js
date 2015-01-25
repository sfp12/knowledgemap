var klm_practice = {
  	userid : 0,
  	courseid : 0,
    ksname : [],       //为答案的选项做准备
  	instance : {},
  	overlays : [],
    connectors : [],
    correct_answer : '',
    ksname_show : []          //在结构图中包含的知识点
};

//练习模块的入口
function klm_practice_js_showPracticeList(){
	//呈现我的列表需要初始化的信息
  klm_practice.userid = 1;
  klm_practice.courseid = 1;  
  klm_practice.ksname = [],       //存储userid本身和0的ksname，为了autocomplete用
  klm_practice.instance = {},
  klm_practice.overlays = [],
  klm_practice.connectors = [],
  klm_practice.correct_answer = '',
  klm_practice.ksname_show = []          //在结构图中包含的知识点
  
  // 获得ksname
  var argsdata={"userid":klm_practice.userid, "courseid":klm_practice.courseid};
  var data={clazz:'com.exam.action.proxy.student.klmpractice.KLMPraticeProxy',service:'getKsnameAll',args:JSON.stringify(argsdata)};
  var success=function(data){
    //找出用户的知识点名称:ksname
    console.log('getKsnameAll success callback');
    console.log('getKsnameAll:'+data);
    
    klm_practice.ksname = data;

    klm_practice_js_getKsmitem();          
  };
  invoke_proxy(data,success);
}

//获得ksmiid和courseid
function klm_practice_js_getKsmitem(){
  console.log('klm_practice_js_showPracticeList');
  var tabTempName = '练习列表';    
  var content=''; 
  content+="<table class='AJAX_TABLE_ID' cellspacing='0' ><thead><tr><th scope=col>ksmiid</th><th scope=col>courseid</th><th scope=col>已做次数</th><th scope=col>平均得分</th><th scope=col>做题</th></tr></thead>";
  content+="<tbody>";
  content+="<tr><img height=29px width=29px src='../image/processing.gif'></img>&nbsp;数据正在加载请稍候...</tr>"
  content+='</tbody></table>';
  content+='<div id="klm_practice_list_pagination" class="pagination">';
  content+='</div>';
  addTab('klm_practice_list',tabTempName,content);

  // 获得ksmiid,courseid
  var argsdata={"courseid":klm_practice.courseid};
  var data={clazz:'com.exam.action.proxy.student.klmpractice.KLMPraticeProxy',service:'getKsmitem',args:JSON.stringify(argsdata)};
  var success=function(data){    
    console.log('getKLMPratice success callback');
    console.log('getKLMPratice:'+data);    

    if(data != 'null'){
      //对每个ksmiid都需要取count和score:ksmid, courseid
      var newcontent = '';
      newcontent+="<table class='AJAX_TABLE_ID' cellspacing='0' ><thead><tr><th scope=col>ksmiid</th><th scope=col>courseid</th><th scope=col>已做次数</th><th scope=col>平均得分</th><th scope=col>做题</th></tr></thead>";
      newcontent+="<tbody>";
      newcontent+='</tbody></table>';
      $('#cklm_practice_list').html(newcontent);      
      for(var i=0; i<data.length; i++){
        klm_practice_js_getKsmreponse(data[i][0], data[i][1]);
      }
    }else{
      content+="<tr>";      
      content+=("<td colspan='100%' align='center'>暂时没有数据</td>");
      content+="</tr>";
      content+='</tbody></table>';
      $('#cklm_practice_list').html(content);
    }    
  };
  invoke_proxy(data,success);
}

//获得做题的个数和平均分
function klm_practice_js_getKsmreponse(ksmiid, courseid){  
  // 获得Ksmreponse
  var argsdata={"userid":klm_practice.userid, "ksmiid":ksmiid};
  var data={clazz:'com.exam.action.proxy.student.klmpractice.KLMPraticeProxy',service:'getKsmreponse',args:JSON.stringify(argsdata)};
  var success=function(data){    
    console.log('getKsmreponse success callback');
    console.log('getKsmreponse:'+data);    
    
    var newcontent = '';
    newcontent+="<tr>";
    newcontent+=("<td>"+ksmiid+"</td>");                  
    newcontent+=("<td>"+courseid+"</td>");
    if(data != ''){
      //count_score             
      newcontent+=("<td>"+data[0].split('_')[0]+"</td>");
      newcontent+=("<td>"+(data[0].split('_')[1]*100).toFixed(2)+"</td>");        
    }
    //做每道题时，不知道选什么名字好，先用ksmid 代替
    var ksmname = '题目';
    var tema="<a title='做题' href='javascript:;' onclick='klm_practice_js_openKiLMPractice(\" "+ksmiid+"\", "+ksmiid+")'>做题</a>";
    newcontent+=("<td>"+tema+"</td>");   
    newcontent+="</tr>";
    $(newcontent).appendTo($('#cklm_practice_list tbody'));
  };
  invoke_proxy(data,success);
}

//重绘ksmid这个图
function klm_practice_js_openKiLMPractice(ksmname, ksmiid)
{
  var content='';
  content += '<div class="klmp_container" style="width:100%; height:455px; margin:0 auto; ">';
  content += '<div style=" width:100%; float:left; position:relative">';
  content += '<div class="klmp_droppable" id="klmp_droppable'+ksmiid+'" style="border: 1px dotted black;height:400px;background-color:white;position:relative;overflow:scroll;"></div>';
  content += '<div id="practice_option'+ksmiid+'"></div>';
  content += '</div></div>';  
  $('.klm_practice').html(content); 
  
  addTab('showklgMapPDetailPage_'+ksmiid,ksmname,content);   

  //加载布局，样式等基本的功能，不用区分1,2，不会新建的
  klm_practice_js_newKLMPJs(ksmiid);
  //加载内容。
  klm_practice_js_getKsmitemdetails(ksmiid);
}

//呈现新建结构图界面的第二步。加载很多事件
function klm_practice_js_newKLMPJs(){
    klm_practice.overlays = [
            ['Arrow', {location:.5}, {foldback: .3, fillStyle: 'white', width: 30}],
            ];
    klm_practice.instance = jsPlumb.getInstance({      
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
          PaintStyle:{strokeStyle:'steelblue', lineWidth:3},
          EndpointStyle:{radius:6, fillStyle:'#222'},
          HoverPaintStyle:{strokeStyle:'green'},
          EndpointHoverStyle:{fillStyle:'red'},
          Container:$('.klmp_droppable')
        });        
}

//获得知识点的相关信息：ksid,ksidparent
function klm_practice_js_getKsmitemdetails(ksmiid)
{ 
  klm_practice.correct_answer = '';
  var argsdata={"ksmiid":ksmiid};
  var data={clazz:'com.exam.action.proxy.student.klmpractice.KLMPraticeProxy',service:'getKsmitemdetails',args:JSON.stringify(argsdata)};
  var success=function(data){
    console.log('getKsmitemdetails success callback');
    //ksid, ksidparent, question
    console.log('getKsmitemdetails:'+data);

    //存储连线
    var connectors = [];
    var deep_tree = 0;
    if(data != ''){
      for(var i =0; i<data.length; i++){      
        if(data[i][1] != 0){
          var connector = {};
          connector.source = 'nodep'+ksmiid+"_"+data[i][1];
          connector.target = 'nodep'+ksmiid+"_"+data[i][0];
          connectors.push(connector);
          // console.log('source:'+connector.source);
          // console.log('target:'+connector.target);
        }
      }
    }    

    klm_practice.connectors = connectors;

    // 根据ksid找ksname，再呈现。
    if(data != ''){
      for(var i=0; i<data.length; i++){
        //根节点
        if(data[i][1] == 0){
          klm_practice_js_getKsname(connectors, 1, deep_tree, 1, data.length, data[i][2], data[i][0], ksmiid);

          //到这一步，应该能找到根节点了
          console.log('根节点正常显示，好的');

          //找根节点的子节点
          klm_practice_js_rootToChild(connectors, ksmiid, deep_tree, data, data[i][0], 1)
        }        
      }
    }
 };
  invoke_proxy(data,success);
}

//从根节点出发，找各节点的子节点
function klm_practice_js_rootToChild(connectors, ksmiid, deep_tree, ksmitemdetails, root, node_count){
  //node_count=1,以后要增加
  deep_tree = deep_tree+1;
  var y_index = 0
  var x_array = [];

  for(var i=0; i<ksmitemdetails.length; i++){
    if(ksmitemdetails[i][1] == root){
      // console.log('node_count:'+node_count);
      node_count++;
      y_index++;
      x_array.push(ksmitemdetails[i][0]);
      klm_practice_js_getKsname(connectors, node_count, deep_tree, y_index, ksmitemdetails.length, ksmitemdetails[i][2], ksmitemdetails[i][0], ksmiid); 
    }
  }
   
  for(var i=0; i<x_array.length; i++){
    klm_practice_js_rootToChild(connectors, ksmiid, deep_tree, ksmitemdetails, x_array[i], node_count);
  }
}

//根据ksid找ksname
function klm_practice_js_getKsname(connectors, node_count, deep_tree, y_index, nodes_num, question, ksid, ksmiid)
{ 
  // 获得Ksname
  var argsdata={"ksid":ksid};
  var data={clazz:'com.exam.action.proxy.student.klmpractice.KLMPraticeProxy',service:'getKsname',args:JSON.stringify(argsdata)};
  var success=function(data){
    //ksname
    console.log('getKsname success callback');
    console.log('getKsname:'+data);
    //需要考虑：位置；id
    var content = '';
    //存储结构图中出现的知识点
    klm_practice.ksname_show.push(data);
    //question=0，显示
    if(question == 0){
      content += "<div  class='kl_drag_enter_drop'; id='nodep"+ksmiid+"_"+ksid+"' style='height:40px; background-color: steelblue; color:white;position:absolute;left:"+(100*y_index)+"px;top:"+(30+(95*deep_tree))+"px'><p class='node_name' style='margin: 0; line-height: 40px;  padding:0 4px;' id='nodep_name"+ksmiid+"_"+ksid+"'>"+data+"</p><p class='node_nameh' style='margin: 0; line-height: 40px; display: none;' id='nodep_nameh"+ksmiid+"_"+ksid+"'>"+data+"</p></div>";      
    }else{      
      klm_practice.correct_answer = data;      
      content += "<div  class='kl_drag_enter_drop'; id='nodep"+ksmiid+"_"+ksid+"' style='height:40px; background-color: steelblue; color:white;position:absolute;left:"+(100*y_index)+"px;top:"+(30+(95*deep_tree))+"px'><p class='node_name' style='margin: 0; line-height: 40px;  padding:0 4px;' id='nodep_name"+ksmiid+"_"+ksid+"'>???</p><p class='node_nameh' style='margin: 0; line-height: 40px; display: none;' id='nodep_nameh"+ksmiid+"_"+ksid+"'>"+data+"</p></div>";      
    } 
    $(content).appendTo($('#klmp_droppable'+ksmiid));

    //这样就可以判断是否加载完成了
    if($('#klmp_droppable'+ksmiid+' .kl_drag_enter_drop').length == nodes_num){
      klm_practice_js_addEndPoint(klm_practice.instance, klm_practice.overlays, connectors, 0, '#klmp_droppable'+ksmiid);
      //对应选项的ksname
      var answer_option_index = [];

      //正确答案在answer_option_index中的位置
      var answer_index = Math.floor(5*Math.random());
      answer_option_index[answer_index] = klm_practice.correct_answer;      

      //ksname中去除 包含在结构图中的知识点 的知识点
      var another_answer = [];
      //去除ksname中，属于ksname_show的元素
      for(var i=0; i<klm_practice.ksname.length; i++){
        var ksname_item = klm_practice.ksname[i];
        var sign = 0;

        for(var j=0; j<klm_practice.ksname_show.length; j++){
          //ksname_show[j] == ksname[i]
          if(klm_practice.ksname_show[j] == ksname_item){
            sign = 1;            
          }
        }

        if(sign == 0){
          another_answer.push(ksname_item);
        }
      }      

      //错误答案在another_answer中的位置 的数组
      var answer_option_wrong = klm_practice_js_getRandomArray(another_answer.length);
      console.log('answer_option_wrong:'+answer_option_wrong);

      //answer_option_index中除了正确答案之外 其他错误答案的个数或id
      var answer_wrong_count = 0;
      for(var i=0; i<5; i++){
        //answer_option_index[i]不存在
        if(!answer_option_index[i]){
          answer_option_index[i] = another_answer[answer_option_wrong[answer_wrong_count]];
          answer_wrong_count++;
        }
      }

      var content_1 = '';
      content_1 += "<div style='margin-top:10px; width: 80%;'>";
      for(var i=0; i<answer_option_index.length; i++){
        content_1 += "<label style='margin-right: 70px;'><input name='answer' type='radio' value='"+answer_option_index[i]+"'>"+answer_option_index[i]+"</label>";
      }
      content_1 += "<button id='practice_answer' style='margin-left:100px'>确定</button>";
      content_1 += "</div>";
      $('#practice_option'+ksmiid).html(content_1);
      $('#practice_answer').click(function(){
        console.log($('input[name="answer"]:checked').val());
        //上传到ksmresponse
        klm_practice_js_insertKsmresponse(ksmiid, $('input[name="answer"]:checked').val(), klm_practice.correct_answer[0]);
      })
    }   
  };
  invoke_proxy(data,success);   
}

//插入选择的结果
function klm_practice_js_insertKsmresponse(ksmiid, response_name, c_s_name){
  var score = 0;
  if(response_name == c_s_name){
    score = 1;
  }
  console.log('response_name:'+response_name);
  console.log('c_s_name:'+c_s_name);
  console.log('score:'+score);
  // 获得Ksmreponse
  var argsdata={"userid":klm_practice.userid, "ksmiid":ksmiid, "response_name":response_name, "c_s_name":c_s_name, "score":score};
  var data={clazz:'com.exam.action.proxy.student.klmpractice.KLMPraticeProxy',service:'insertKsmresponse',args:JSON.stringify(argsdata)};
  var success=function(data){
    console.log('insertKsmresponse success');
    klm_practice_js_showPracticeList();
  };
  invoke_proxy(data,success);
}

//返回一个数组，包含0-max的四个随机数
function klm_practice_js_getRandomArray(max){
  var result = [];
  
  while(result.length < 4){
    var item = Math.floor(max*Math.random());
    if(result.length != 0){
      var sign = 0;

      for(var i=0; i<result.length; i++){
        if(result[i] == item){
          sign = 1;
        }
      }

      if(sign == 0){
        result.push(item);
      }
    }else{
      result.push(item);
    }    
  }

  return result;
}

//给新增的元素增加链接端点
function klm_practice_js_addEndPoint(instance, overlays, connectors, only, selector){
    var ele_add_point = {};
    instance.doWhileSuspended(function(){
      if(only == 1){
        ele_add_point = jsPlumb.getSelector('.kl_drag_enter_drop').last();        
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
          instance.connect({uuids:[connectors[i].source+'-bottom',connectors[i].target+'-top'], overlays:overlays});
        }
      }
      instance.draggable(ele_add_point);
    });
    ele_add_point = jsPlumb.getSelector('.kl_drag_enter_drop');
    instance.draggable(ele_add_point);
    jsPlumb.fire('jsPlumbdemoLoaded', instance);      
};

/**
 * 生成不重复且唯一的数组
 * @param 10
 * @return [1, 2, 3, 0, 8, 7, 6, 4, 5, 9]
 */
function klm_practice_js_getRandom(max){
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