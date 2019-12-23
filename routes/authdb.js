var express = require('express');
var router = express.Router();
const config = require('../config')
var jwt = require('jsonwebtoken');
var bcrybt = require('bcrypt');
var db = require('../db/test');

/*
    recqive email and password
    fine user
    gen token
*/


//check duplicate username
router.post('/checkuser', (req, res, next) => {
    //console.log(req.body);
    const { name } = req.body.userData;

    if (name === undefined) {
        res.status(401).json({
            success: false,
            message: "Please put youe username"
        })
    } else {
        //find user in mongodb

        const handler = (err, result) => {
            if (!err && result !== null) {
                res.json({
                    success: true,
                });
            }else{
                res.status(401).json({
                    success: false,
                    message: 'Username already exists.'
                })
            }

        }

        db.findUser({ name }, handler)


    }


});

router.get('/verifytoken', (req, res, next) => {
    //[0] = Bearer ----  [1] = token
    let token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, config.JWT_KEY, (err, decode) => {
        if(!err) {
            res.json({
                success: true,
                message: "Token is valid."
            });
        }else{
            res.status(401).json({
                success: false,
                error: err
            });
        }
    })
})

module.exports = router;