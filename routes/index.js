var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');
// var pdfMake = require('pdfmake-browserified');
var phantom = require('phantom');
var fs = require('fs');

function convert_to_excel(db, collection, callback){
	var coll = db.collection(collection);
	coll.find().toArray(function(err, items){
		if(err) {console.log("Not Found..........");}
		if(items.length > 0){
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
		}
		else{
			var error = {
			status: 404
			}
			res.render('error', {
				message : "Not Found",
				error: error
			});
		}
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
		if(err) {console.log("Not Found..........");}
		if(items.length > 0){
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

			var html="<table border='1' style='width:100%'><tr>";
			for(var j=0; j<keys_array.length; j++){
				html = html + "<th>" + keys_array[j] + "</th>"
			}
			html = html + "</tr><tr>";

			for(var i=0; i< items.length; i++){
				for(var j=0; j<keys_array.length; j++){
					html = html + "<td> " + items[i][keys_array[j]] + "</td>";
				}
				html = html + "</tr><tr>";
			}
			html = html.slice(0,-4);

			fs.writeFile("table.html", html, function(){
				if(err){
					return console.log(err);
				}
				console.log("File generated.");
			});

			phantom.create().then(function(ph) {
				ph.createPage().then(function(page) {
					page.open("table.html").then(function(status) {
						page.render('table.pdf').then(function() {
							console.log('Page Rendered');
							ph.exit();
						});
					});
				});
			});

			// console.log("Converted");
			var path = "table.pdf";
			res.render('index', {
				title: 'Express',
				isReady: "pdf",
				path: path,
			});
		}
		else{
			var error = {
			status: 404
			}
			res.render('error', {
				message : "Not Found",
				error: error
			});
		}
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
