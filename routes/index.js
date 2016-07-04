var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');

function convert_data(db, collection, callback){
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

/* GET home page. */
router.get('/', function(req, res, next){
	res.render('index', {
		title: 'Express',
		isReady: false
	});
});


router.post('/to_excel', function(req, res, next) {
	console.log(req.body.db);
	var url = "mongodb://localhost:27017/" + req.body.db;
	MongoClient.connect(url, function(err, db){
		if(err){ return console.dir(err);}
		convert_data(db, req.body.collection, function(path){
			console.log("Converted");
			res.render('index', {
				title: 'Express',
				isReady: true,
				path: path,
			});
		});	
	});
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
