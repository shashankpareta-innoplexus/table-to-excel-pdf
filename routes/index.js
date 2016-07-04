var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');

function get_data(db, callback){
	var collection = db.collection('dummy');
	collection.find().toArray(function(err, items){
		// console.log(items[0]);
		callback(items);
		//convert here
	});
}

var http = require('http');
var fs = require('fs');

var download_it = function(url, dest, cb) {
	var file = fs.createWriteStream(dest);
	var request = http.get(url, function(response) {
		console.log("HTTP Request sent..");
		response.pipe(file);
		file.on('finish', function() {
			file.close(cb);  // close() is async, call cb after close completes.
		});
	});
}

function convert_to_excel(items){
	var model = mongoxlsx.buildDynamicModel(items);
	// Generate Excel file
	mongoxlsx.mongoData2Xlsx(items, model, function(err, data){
		// console.log('File Saved at: ', data.fullPath);
		console.log(data);
		var url = "/home/rajat.choudhary/Documents/table_to_excel-pdf/table-to-excel-pdf/" + data.fileName;
		download_it(url, data.fullPath, function(){
			console.log("downloaded");
		});
	})
}

/* GET home page. */
router.get('/to_excel', function(req, res, next) {
	MongoClient.connect("mongodb://localhost:27017/table_db", function(err, db){
		if(err){ return console.dir(err);}
		get_data(db, function(items){
			// console.log(items[0]);
			//convert here
			convert_to_excel(items);
		});
		
	});
	res.render('index', { title: 'Express' });
});



module.exports = router;
