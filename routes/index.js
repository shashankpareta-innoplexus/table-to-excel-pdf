var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongoxlsx = require('mongo-xlsx');

function get_data(db, collection, callback){
	var coll = db.collection(collection);
	coll.find().toArray(function(err, items){
		// console.log(items[0]);
		callback(items);
		//convert here
	});
}

function convert_to_excel(items, cb){
	var model = mongoxlsx.buildDynamicModel(items);
	// Generate Excel file
	mongoxlsx.mongoData2Xlsx(items, model, function(err, data){
		// console.log('File Saved at: ', data.fullPath);
		console.log(data);
		cb(data.fullPath);
	})
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
		get_data(db, req.body.collection, function(items){
			convert_to_excel(items, function(path){
				console.log("Converted");
				res.render('index', {
					title: 'Express',
					isReady: true,
					path: path
				});
			});
		});	
	});
});

router.get('/download/:file(*)', function(req, res){
	var path=require('path');
	var file = req.params.file;
	console.log(file);
	var path = path.resolve(".")+'/'+file;
	console.log(path);
	console.log("Downloading Start");
	res.download(path);
});


module.exports = router;
