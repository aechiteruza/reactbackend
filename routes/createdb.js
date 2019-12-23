var express = require('express');
var router = express.Router();
var db = require('../db/test');
var jwt = require('jsonwebtoken');
const config = require('../config');
var bcrypt = require('bcrypt');
var Docker = require('dockerode');
    var dockerHostIP = "172.20.10.2"
    var dockerHostPort = 2375 
const Influx = require('influx');
const influx = new Influx.InfluxDB('http://172.20.10.2:8086/')


const handleToken = (req, res, next) => {
  //if authenticated and valid token
  //return next
  //if not 401
  let token = req.headers['authorization'].split(' ')[1];
  jwt.verify(token, config.JWT_KEY, (err, decode) => {
    if (!err) {
      next()
    } else {
      res.status(401).json({
        success: false,
        error: err
      });
    }
  })
}


/* GET users listing. */
router.post('/register', (req, res, next) => {
  const { username,selectdb, dbname, name, password } = req.body.userData;
  console.log(username,selectdb, dbname, name, password)
  const hash = bcrypt.hashSync(password, config.SALT_ROUNDS);
  var type1 = "InfluxDB"
  if(type1 == selectdb){var host="172.20.10.2:8086"; var link="https://timeseriesadmin.github.io/"}else{var host="172.20.10.2:27017"; var link="https://www.mongodb.com/products/compass"}
  const dataToInsert = {
    username,
    selectdb,
    dbname,
    name,
    host,
    link,
    password: hash
  };


  const handler = (err, result) => {
    if (!err) {
      res.json({
        success: true,
        message: "User Registered.",
        data: result
      });
    } else {
      res.json({
        success: false,
        message: "User not Registered.",
        data: result
      });
    }

  }
  db.register(dataToInsert, handler);
  // Influxdb
  var type = "InfluxDB"
  if(type == selectdb){
    console.log("dddddddd")
    let dataname = dbname;
    let dbuser = name;
    let dbpassword = password;
  
//CREATE USER+DB
   influx.createDatabase(dataname)
   influx.createUser(dbuser, dbpassword)
   influx.grantPrivilege(dbuser, 'ALL', dataname)
//console.log("5555555555")
}
  else{
    console.log("finish")}
});

router.post('/deletecontainner',(req, res, next) => {
  //console.log(req.body);
      //find user in mongodb
      const { dbname } = req.body.userData;
      console.log(dbname);
       //var namecon = username.concat(namered)
      const handler = (err, result) => {
      if (!err) {
        res.json({
          success: true,
          message: "User Registered.",
          data: result
        });
      } else {
        res.json({
          success: false,
          message: "User not Registered.",
          data: result
        });
      }
      } 
      db.deletecontainner( dbname,handler)
      
      var docker = new Docker({ host: dockerHostIP, port: dockerHostPort });
      var container = docker.getContainer(dbname);

      
       
      container.remove(function (err, data) {
        console.log(data);
      
      
      }); 
      
  })

  router.post('/runcontainer',(req, res, next) => {
    const {selectdb, dbname } = req.body.userData;
      console.log(selectdb, dbname);
      res.json({
        success: true,
        data: "Device not run"
      });        
        var type = "InfluxDB"
        if(type == selectdb){ 
          console.log(selectdb)
          var docker = new Docker({ host: dockerHostIP, port: dockerHostPort }); 
         // Run Create ImageInflux
          influx.createDatabase(dbname) //create database influx
          docker.run('influxdb', [], undefined, { 
            "name": dbname, //ชื่อ containner ต้องรับจากผู้ใช้
            
            "HostConfig": {
              "PortBindings": {
                "8086/tcp": [
                  {
                      "HostIp": "0.0.0.0",
                    "HostPort": "0"   //Map container to a random unused port.
                  }
                ]
              }
            }
          }, function(err, data, container) {
            if (err){
              return console.error(err);
            }
            console.log(data.StatusCode);
          });

      }
      else if(type !== selectdb){ 
            console.log(selectdb)
          var docker = new Docker({ host: dockerHostIP, port: dockerHostPort }); 
          
          docker.createContainer({
            name: dbname,
            Image: 'mongo',
            AttachStdin: false,
            AttachStdout: false,
            AttachStderr: false,
            Tty: false,
            Cmd: [],
            OpenStdin: false,
            StdinOnce: false,
            HostConfig: {
                        PortBindings: {
                            "27017/tcp": [
                            {
                                HostIp: "0.0.0.0",
                                HostPort: "0"   //Map container to a random unused port.
                            }
                          ]
                        }
                      }
          
          }).then(function(container) {
            return container.start();
          }).catch(function(err) {
            console.log(err);
          });

        }

    })

   /* router.post('/stopcontainner',(req, res, next) => {
      //console.log(req.body);
          //find user in mongodb
          const { dbname } = req.body.userData;
          
    
  var docker = new Docker({ host: dockerHostIP, port: dockerHostPort });
          var container = docker.getContainer(dbname);
         container.stop(function (err, data) {
           console.log(data);
          });
      }) 
*/


router.post('/listusers',(req, res, next) => {
  //console.log(req.body);
      //find user in mongodb
      const { username } = req.body.userData;
      console.log(username)
      const handler = (err, result) => {
          if (!err && result !== null ) {
            result.toArray((err, users) => {
              if (!err) {
                res.json({
                  success: true,
                  selectdb: result.selectdb,
                  dbname: result.dbname,
                  name: result.name,
                  host: result.host,
                  data: users
                });
              }
            })
          }else{
              res.json({
                  success: false,
                  
                  error:err
              })
          }

      }

      db.findAll( username,handler)


  })
/*
router.post('/listusers',handleToken, (req, res, next) => {
  //Return list of user and need to authenticated(verufy token)
  const handler = (err, result) => {
    if (!err && result != null) {
      result.toArray((err, users) => {
        if (!err) {
          res.json({
            success: true,
            message: "The list of users.",
            data: users
          });
        }
      })
    } else {
      res.json({
        success: false,
        message: "An error happened.",
        data: err
      });
    }
  }
  db.findAll(handler);
})
*/
module.exports = router;
