var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');
// var pdfMake = require('pdfmake-browserified');
var phantom = require('phantom');
var fs = require('fs');

//Take collection name and collection in form of array as argumnets and convert that array in excel files
function convert_to_excel(items, collection, callback){

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
}

//Takes collection data in form of array and collection name as arguments and returns the convert pdf file path
function convert_to_pdf(items, collection, callback){
	
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
		keys_array = Object.keys(items[0]);
		// Make it dynamically
		var style = "<style> body{font-size: 9pt;} table, th, td { border: 1px solid black; border-collapse: collapse;} th, td { padding: 5px;} table{ width:100%;}</style>";

		var html = "<!DOCTYPE html>\n<html>\n<head>\n" + style + "\n</head>\n<body>\n";

		html = html + "<table>\n<tr>\n";
		for(var j=0; j<keys_array.length; j++){
			html = html + "\n<th>" + keys_array[j] + "</th>"
		}

		html = html + "\n</tr>\n<tr>";

		for(var i=0; i< items.length; i++){
			for(var j=0; j<keys_array.length; j++){
				html = html + "\n<td>" + items[i][keys_array[j]] + "</td>\n";
			}
			html = html + "</tr>\n<tr>\n";
		}
		html = html.slice(0,-4);
		html = html + "</body>\n</html>";

		var html_filename = collection + ".html";
		var pdf_filename = collection + ".pdf";

		fs.writeFile(html_filename, html, function(err){
			if(err){
				return console.log(err);
			}
			console.log("File generated.");
		});

		//Phantom creates the pdf here using promises
		phantom.create().then(function(ph) {
			ph.createPage().then(function(page) {
				//do something with page
				page.property('paperSize', {format: 'A4', margin: '.2cm'}).then(function() {
					page.open(html_filename).then(function(status) {						
						page.render(pdf_filename).then(function() {
							console.log('Page Rendered');
							ph.exit();
						});						
					});
				});
			});
		});

		// console.log("Converted");
		callback(pdf_filename);
		
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
}


function convert_excel(url, collection, res){
	MongoClient.connect(url, function(err, db){

		if(err){ return console.dir(err);}

		var coll = db.collection(collection);
		coll.find().toArray(function(err, items){
			if(err) {console.log("Not Found..........");}

			convert_to_excel(items, collection, function(filename){
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

			convert_to_pdf(items, collection, function(filename){
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
