var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');
var pdfMake = require('pdfmake');

function convert_to_excel(db, collection, callback){
	var coll = db.collection(collection);
	coll.find().toArray(function(err, items){
		for (var i = 0; i < items.length; i++) { 
			if(items[i].hasOwnProperty("_id")){
				delete items[i]['_id'];
			}
			if(items[i].hasOwnProperty("__v")){
				delete items[i]['__v'];
			}
		}
		var model = mongoxlsx.buildDynamicModel(items);
		// Generate Excel file
		mongoxlsx.mongoData2Xlsx(items, model, function(err, data){
			console.log(data);
			var fs = require('fs');
			var new_name = collection+".xlsx";
			console.log(new_name);
			fs.rename(data.fileName, new_name, function(err) {
				if ( err ) console.log('ERROR: ' + err);
			});
			callback(new_name);
		});
	});
}

function convert_excel(url, collection, res){
	MongoClient.connect(url, function(err, db){
		if(err){ return console.dir(err);}
		convert_to_excel(db, collection, function(path){
			console.log("Converted");
			res.render('index', {
				title: 'Express',
				isReady: "excel",
				path: path,
			});
			// cb();
		});	
	});
}

function convert_to_pdf(db, collection, res){
	var coll = db.collection(collection);
	coll.find().toArray(function(err, items){
		for (var i = 0; i < items.length; i++) { 
			if(items[i].hasOwnProperty("_id")){
				delete items[i]['_id'];
			}
			if(items[i].hasOwnProperty("__v")){
				delete items[i]['__v'];
			}
		}
		//convert here
		// console.log(items.length);
		keys_array = Object.keys(items[0]);

		var bodyContent = [];
		bodyContent.push(keys_array);
		var new_array = [];

		for(var i=0; i< items.length; i++){
			for(var j=0; j<keys_array.length; j++){
				new_array.push(items[i][keys_array[j]]);
			}
			bodyContent.push(new_array);
			new_array = [];
		}
		// console.log("Converted");
		var path = "newname";
		res.render('index', {
			title: 'Express',
			isReady: "pdf",
			path: path,
			bodyContent: bodyContent
		});
		// cb();
	});
}

function convert_pdf(url, collection, res){
	MongoClient.connect(url, function(err, db){
		if(err){ return console.dir(err);}
		convert_to_pdf(db, collection, res);	
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
	// console.log(req.body.pdf);

	if (req.body.button=="Convert To Excel File") {
		convert_excel(url, collection, res);
	}

	if (req.body.button=="Convert To PDF File") {
		convert_pdf(url, collection, res);
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
