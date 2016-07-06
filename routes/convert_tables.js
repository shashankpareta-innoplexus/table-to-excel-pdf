var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');
// var pdfMake = require('pdfmake-browserified');
var phantom = require('phantom');
var fs = require('fs');



//Take collection name and collection in form of array as argumnets and convert that array in excel files

var convert_to_excel = function(items, collection, callback){

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
var convert_to_pdf = function(items, collection, callback){
	
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

		var html = "<!DOCTYPE html><html><head>"+ style +"</head>";

		html = html + "<body><table><tr>";

		for(var j=0; j<keys_array.length; j++){
			html = html + "\n<th>" + keys_array[j] + "</th>"
		}

		html = html + "\n</tr>\n<tr>";

		for(var i=0; i< items.length; i++){
			for(var j=0; j<keys_array.length; j++){
				html = html + "\n<td>" + items[i][keys_array[j]] + "</td>\n";
			}
			html = html + "</tr><tr>";
		}
		html = html.slice(0,-4);
		html = html + "</body>\n</html>";
		// html = unescape(html);
		// console.log(html);

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

module.exports = {
  convert_to_pdf: convert_to_pdf,
  convert_to_excel: convert_to_excel
};