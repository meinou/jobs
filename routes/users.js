var express= require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var router = express.Router();
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

router.use(bodyParser.json());

router
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get('/', cors.corsWithOptions, function(req, res, next){
    User.find(function(err, users) {
        if (err) res.status(500).send(err);
        else {
          res.json(users);
        }
    });
   // res.send('respond with resourse');
});

router
//.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post('/signup', cors.corsWithOptions, function(req, res, next) {
    User.register( new User({ username: req.body.username}), 
        req.body.password, (err, user) => {
        if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
        }
        else {
            passport.authenticate('local')(req, res, () => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({  
                    success: true, 
                    status: 'Registration successfull'
                });
            });
        }
    });
});

router
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {
    var token = authenticate.getToken({ _id:req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({  
        success: true, 
        token: token,
        status: 'You are successfully logged in'
    });
});
//
router
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }
    else {
        var err = new Error('You are not logged in');
        err.status = 403;
        next(err);
    }
});

module.exports = router;