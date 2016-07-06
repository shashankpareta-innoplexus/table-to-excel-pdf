'use strict';

var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');
// var pdfMake = require('pdfmake-browserified');
var phantom = require('phantom');
var fs = require('fs');

var convert_tables = require('./convert_tables');
// console.log(convert_tables.convert_to_excel);


function convert_excel(url, collection, res){
	MongoClient.connect(url, function(err, db){

		if(err){ return console.dir(err);}

		var coll = db.collection(collection);
		coll.find().toArray(function(err, items){
			if(err) {console.log("Not Found..........");}

			convert_tables.convert_to_excel(items, collection, function(filename){
				console.log("Converted");
				res.render('index', {
					title: 'Express',
					isReady: "excel",
					path: filename,
				});
			});
		});
	});
}


function convert_pdf(url, collection, res){
	MongoClient.connect(url, function(err, db){
		if(err){ return console.dir(err);}

		var coll = db.collection(collection);
		coll.find().toArray(function(err, items){
			if(err) {console.log("Not Found..........");}

			convert_tables.convert_to_pdf(items, collection, function(filename){
				console.log("Converted");
				res.render('index', {
					title: 'Express',
					isReady: "pdf",
					path: filename,
				});
			});	
		});
	});
}

/* GET home page. */
router.get('/', function(req, res, next){
	res.render('index', {
		title: 'Express',
		isReady: "",
		path: "hello",
	});
});


router.post('/convert', function(req, res, next) {
	// console.log(req.body.db);
	var url = "mongodb://localhost:27017/" + req.body.db;
	var collection = req.body.collection;
	console.log(req.body.button);
	if (req.body.collection && req.body.db){
	// console.log(req.body.pdf);
		if (req.body.button=="Convert To Excel File") {
			convert_excel(url, collection, res);
		}

		if (req.body.button=="Convert To PDF File") {
			convert_pdf(url, collection, res);
		}
	} else {
		var error = {
			status: 500
		}
		res.render('error', {
			message : "Empty Fields",
			error: error
		});
	}
});

router.get('/download/:file(*)', function(req, res){
	var path=require('path');
	var file = req.params.file;
	console.log(file.slice(11));
	var path = path.resolve(".")+'/'+ file;
	console.log(path);
	console.log("Downloading Start");
	res.download(path);
});


module.exports = router;
