const express = require('express');
const User = require('../models/user');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//configuring the response for signUp
router.post('/signUp',(req,res,next)=>{
  User.findOne({
    username:req.body.username
  })
  .then(user => {
    if(user){
      const err = new Error(`Username ${req.body.username} already exists`);
      res.statusCode = 403;
      return next(err);
    }
    else{
      User.create({
        username:req.body.username,
        password:req.body.password
      })
      .then(user => {
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({status:"Successfully signed-up",user:user});
      })
    }
  })
  .catch(err => next(err));
})

router.post('/login',(req,res,next)=>{
  if(!req.session.user){
    const authHeader = req.headers.authorization;//obtaining authorization field value from request header
  //If authorization value is null, sending a 401 error and a popup to enter credentials
    if(!authHeader){
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Autheticate','Basic');
      err.status=401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1],'base64');//using buffer inbuilt function 
    const newAuth = auth.toString().split(':');
    const username = newAuth[0];
    const password = newAuth[1];
    //verifying the credentials
    User.findOne({
      username:username
    }).then(user => {
      if(!user){
        const err = new Error(`Username ${username} is incorrect`);
        res.statusCode = 401;
        return next(err);
      }else if(user.password !== password){
        const err = new Error(`Password ${password} is incorrect`);
        res.statusCode = 401;
        return next(err);
      }else if(user.username === username && user.password===password){
        req.session.user = 'authenticated';
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.end('You are authenticated!');
      }
    }).catch(err => next(err));
  }else{
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
  
})

router.get('/logout',(req,res,next)=>{
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else{
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
})

module.exports = router;
