const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const router = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

/* GET users listing. */
router.get('/',cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {//#1
  User.find()
    .then(users => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ users: users });
    })
    .catch(err => next(err));
});

//configuring the response for signUp
router.post('/signUp',cors.corsWithOptions, (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err })
      }
      else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        //check this cond.
        user.save(err => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          })
        })
      }
    }
  )
})

router.post('/login',cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
  console.log(req.user._id.toString());
  const token = authenticate.getToken({ _id: req.user._id });//here we are using only ID as user identification while creating the token
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
})

router.get('/logout',cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
})

//second middleware to authenticate using fb by plugging in the facebook strategy we configured in authenticate.js
router.get('/facebook/token', passport.authenticate('facebook-token', {session: false}), (req, res) => {
  if (req.user) {
      //console.log(req.user);
      const token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;
