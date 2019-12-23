var express = require('express');
var router = express.Router();
var db = require('../db/namemqtt');
var jwt = require('jsonwebtoken');
const config = require('../config');
var bcrypt = require('bcrypt');
var Docker = require('dockerode');
var dockerHostIP = "172.20.10.2"
var dockerHostPort = 2375 

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
  const { username,namemqtt} = req.body.userData;
  console.log("GASFSDFASGASDFGASDH")


  const dataToInsert = {
    
    username,
    namemqtt,
    
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
});

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
                  namemqtt: result.namemqtt,
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

  router.post('/deletecontainner',(req, res, next) => {
    //console.log(req.body);
        //find user in mongodb
        const { username,namemqtt } = req.body.userData;
        console.log(username,namemqtt);
         var namecon = username.concat(namemqtt)
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
        db.deletecontainner( namemqtt,handler)
  
        var docker = new Docker({ host: dockerHostIP, port: dockerHostPort });
        var container = docker.getContainer(namecon);
        container.remove(function (err, data) {
          console.log(data);
        });    
    })

router.post('/runcontainer',(req, res, next) => {
  const { username,namemqtt } = req.body.userData;
  console.log(username,namemqtt);
  res.json({
    success: true,
  data: "Device not run"
  });
   var namecon = username.concat(namemqtt)
    var docker = new Docker({ host: dockerHostIP, port: dockerHostPort });
    //const container = Dockerode.getContainer(namered)
      //console.log(container)
      docker.createContainer({
        name: namecon,
        Image: 'toke/mosquitto',
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
        Cmd: [],
        OpenStdin: false,
        StdinOnce: false,
        HostConfig: {
                    PortBindings: {
                        "1883/tcp": [
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

      /*
      docker.listContainers({ all: true }, function (err, containers) {
        containers.forEach(function (container) {
          console.log("Container    "+ container)
 

              res.send({
                success: true,
                data: container
              });
      })
        
    });
     */
  })

  router.post('/getstatuscontainer', (req, res, next) => {
    const {
      namecontainer
    } = req.body.userData;
    //console.log(namecontainer);
    var docker = new Docker({
      host: dockerHostIP,
      port: dockerHostPort
    });
    var container = docker.getContainer(namecontainer);
    container.inspect(function (err, data) {
    if(data == null){
      res.json({
        success: true,
        data: "exited"
      });
    }else{
      res.json({
        success: true,
        data: data.State.Status
      });  console.log(data.State.Status)
    }
    
    });
  });
  
  router.post('/getportcontainer', (req, res, next) => {
    const {
      namecontainer
    } = req.body.userData;
    console.log(namecontainer);
    var docker = new Docker({
      host: dockerHostIP,
      port: dockerHostPort
    });
    let namecon = [];
    docker.listContainers({all: true}, function (err, containers) {
      // console.log('ALL: ' + containers.length);
      containers.forEach(function (container) {
        namecon.push(container.Names)
        //console.log(container.Names)
        })
        for(let i=0; i< namecon.length; i++){
          if(namecon[i].toString() === "/"+namecontainer){
            const port = JSON.stringify(containers[i].Ports).split(",")[2];
            console.log(JSON.stringify(containers[i].Ports))
            if(port == undefined){
              //console.log("no port");
              res.json({
                success: true,
                data: "Device not run"
              });
            }else{
              const portnumber = port.split(":")[1];
              console.log(portnumber)
              res.json({
                success: true,
                data: "172.20.10.2:"+portnumber
              });
            }
          break;
          }else if(i == namecon.length-1){
            res.json({
              success: true,
              data: "Device not run"
            });
          }else{
            //console.log("Don't Find at I = "+i)
          }
        }
    });
  }); 
  

  router.post('/stopcontainner',(req, res, next) => {
    //console.log(req.body);
        //find user in mongodb
        const { username,namemqtt } = req.body.userData;
        console.log(username,namemqtt);
        
        res.json({
            success: true,
          data: "Device not run"
        });
         var namecon = username.concat(namemqtt)
  
var docker = new Docker({ host: dockerHostIP, port: dockerHostPort });
        var container = docker.getContainer(namecon);
       container.stop(function (err, data) {
         console.log(data);
        });
    }) 
module.exports = router;
