var express = require("express");  
var path = require("path");  
var mongo = require("mongoose");   
var bodyParser = require('body-parser');   
var morgan = require("morgan");  
var db = require('../db/test');
  
var app = express();  
  
var srcpath  =path.join(__dirname,'/public') ;  
app.use(express.static('public'));  
app.use(bodyParser.json({limit:'5mb'}));    
app.use(bodyParser.urlencoded({extended:true, limit:'5mb'}));  
  
  
var mongoose = require('mongoose');  
var Schema = mongoose.Schema;  
var noderedSchema = new Schema({      
    namered: { type: String   },             
},{ versionKey: false });  
   
  
var model = mongoose.model('nodered', noderedSchema, 'nodered');  
  
//api for get data from database  
app.get("/api/getdata",function(req,res){   
 model.find({},function(err,data){  
            if(err){  
                res.send(err);  
            }  
            else{             
                res.send(data);  
                }  
        });  
})  
  
  
//api for Delete data from database  

  
  
//api for Update data from database  
   
  
  
//api for Insert data from database  
app.post("/api/savedata",function(req,res){   
       
    var mod = new model(req.body);  
        mod.save(function(err,data){  
            if(err){  
                res.send(err);                
            }  
            else{        
                 res.send({data:"Record has been Inserted..!!"});  
            }  
        });  
})  
      
// call by default index.html page  
app.get("*",function(req,res){   
    res.sendFile(srcpath +'/index.html');  
})  
  
//server stat on given port  
app.listen(port,function(){   
    console.log("server start on port"+ port);  
})  