var express = require('express');
var router = express.Router();
const config = require('../config')
var jwt = require('jsonwebtoken');
var bcrybt = require('bcrypt');
var db = require('../db/index');

/*
    recqive email and password
    fine user
    gen token
*/
router.post('/login', (req, res, next) => {
    //console.log(req.body);
    const { username, password } = req.body.userData;

    if (username === undefined || password === undefined) {
        res.status(401).json({
            success: false,
            code: 'DD101_API_ERROR_01',
            message: "Email or Password Invalid"
        })
    } else {
        //find user in mongodb

        const handler = (err, result) => {
            if (!err && result !== null && bcrybt.compareSync(password, result.password)) {
                let tokenData = {
                    firstname: result.firstname,
                    lastname: result.lastname,
                    username: result.username,
                    email: result.email
                }
                let genertedToken = jwt.sign(tokenData, config.JWT_KEY, { expiresIn: '60m' });
                res.json({
                    success: true,
                    firstname: result.firstname,
                    lastname: result.lastname,
                    username: result.username,
                    email: result.email,
                    token: genertedToken
                });
            }else{
                res.status(401).json({
                    success: false,
                    code: 'DD101_API_ERROR_02',
                    message: err || 'User does not exist.'
                })
            }

        }

        db.findUser({ username }, handler)


    }


});

//check duplicate username
router.post('/checkuser', (req, res, next) => {
    //console.log(req.body);
    const { username } = req.body.userData;

    if (username === undefined) {
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

        db.findUser({ username }, handler)


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