var express = require('express');
var klm = express.Router();
var mongoose = require('mongoose');
var model = require('../model/klm');
var KsmknowledgeM = model.KsmknowledgeM;
var KsmM = model.KsmM;
var KsmdetailsM = model.KsmdetailsM;

//获取所有的ksname
klm.get('/getKsnameAll', function(req, res) {

	var criteria = {}; 
	var fields   = {ksid : 1, ksname : 1}; 
	var options  = {};
	
	KsmknowledgeM.find(criteria, fields, options, function(error, result){   
	    if(error) {
	        console.log(error);
	    } else {
	    	console.log('获取了所有的ksname');
	        // console.log(result);
	        res.json(result);
	    }	    
	});
});

//获得ksm的信息
klm.get('/getKsmInfo', function(req, res) {

	var criteria = {}; 
	var fields   = {ksmid : 1, ksmname : 1, score : 1, comment : 1}; 
	var options  = {};
	
	KsmM.find(criteria, fields, options, function(error, result){   
	    if(error) {
	        console.log(error);
	    } else {
	    	console.log('获取了所有的ksm的信息');
	        // console.log(result);
	        res.json(result);
	    }	    
	});	
});

//存储新增的知识点
klm.post('/saveNewKs', function(req, res) {

	var criteria = {ksname: req.body.ksname}; 
	var fields   = {}; 
	var options  = {};

	var ksmknowledgeE = new KsmknowledgeM({
		ksname : req.body.ksname
	});
	ksmknowledgeE.save();
	var ksid = ksmknowledgeE.get("id");
	var data = {
		"ksid": ksid
	}
	res.json(data);
});

//存储新的结构图
klm.post('/saveKLM', function(req, res) {

	var score = 100;

	var ksmE = new KsmM({
		comment: req.body.comment,
		score: score,
		ksmname : req.body.ksmname
	});
	ksmE.save();
	var ksmid = ksmE.get("_id");
	console.log('结构图的ksmid:'+ksmid);

	for(var i=0; i<req.body.child.length; i++){
		var node_t = req.body.child[i];		
		var ksmdetailsE = new KsmdetailsM({
			ksmid: ksmid,
			ksid: node_t.ksid,
			ksidparent: node_t.ksidparent,
			label: node_t.label,
			note: node_t.note,
			top4: node_t.top4,
			left4: node_t.left4
		});
		ksmdetailsE.save();
		var ksmdid = ksmdetailsE.get("_id");
	}	
	
	res.send(ksmid+'_'+req.body.ksmname+'_'+req.body.comment);
});

//存储新的结构图:更新ksm，insert ksmdetails
klm.post('/updateKLM', function(req, res) {

	var score = 100;

	var update_klm = {
		score : score,
		comment : req.body.comment,
		ksmname : req.body.ksmname
	};
	var options_klm = {};

	KsmM.findByIdAndUpdate(req.body.ksmid, update_klm, options_klm, function(err){
		if(err){
	        console.log('updateKLM save:'+err);
	    }else{
	    	console.log('find _id');
			console.log('score:'+result.score);
	    } 
		
	})	

	//再插入ksmdetails
	for(var i=0; i<req.body.child.length; i++){
		var node_t = req.body.child[i];		
		var ksmdetailsE = new KsmdetailsM({
			ksmid: req.body.ksmid,
			ksid: node_t.ksid,
			ksidparent: node_t.ksidparent,
			label: node_t.label,
			note: node_t.note,
			top4: node_t.top4,
			left4: node_t.left4
		});
		ksmdetailsE.save();
		var ksmdid = ksmdetailsE.get("_id");
	}	
	
	res.send('updateKLM success');
});

//获得ksmdetails的信息:ksid,ksidparent,label,note,top4,left4
klm.get('/getKs', function(req, res) {

	var criteria = {ksmid: req.query.ksmid}; 
	var fields   = {ksid: 1, ksidparent: 1, label: 1, note: 1, top4: 1, left4: 1}; 
	var options  = {};


	KsmdetailsM.find(criteria, fields, options, function(error, result){   
	    if(error) {
	        console.log(error);
	    } else {
	        console.log(result);
	        console.log('获取ksmdetails的信息');
	        res.json(result);
	    }	    
	});	
});

//列表中的删除，删ksm，删ksmdetails
klm.get('/delKsmid', function(req, res) {

	var id = {_id : req.query.ksmid}; 

	KsmM.remove(id, function(error, result){   
	    if(error) {
	        console.log(error);
	    } else {
	        console.log(result);
	        console.log('删除ksm成功');
	    }	    
	 });

	KsmdetailsM.remove({ksmid: req.query.ksmid}, function(error, result){
		if(error) {
	        console.log(error);
	    } else {
	        console.log(result);
	        console.log('删除ksmdetails成功');
	    }
	});

	res.send('delKsmid return');	
});

//列表中的删除，删ksmdetails
klm.get('/delKsmdetailid', function(req, res) {

	KsmdetailsM.remove({ksmid: req.query.ksmid}, function(error, result){
		if(error) {
	        console.log(error);
	    } else {
	        console.log(result);
	        console.log('删除ksmdetails成功');
	    }
	});

	res.send('delKsmdetailid return');	
});

module.exports = klm;