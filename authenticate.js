const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const ExtractJwt = require('passport-jwt').ExtractJwt; //The module contains some helper methods to extract jwt from request(either from header, body or url)
const jwt = require('jsonwebtoken');//used to create, sign, verify Tokens


const User = require('./models/user');
const config = require('./config.js');
const { NotExtended } = require('http-errors');
const { response } = require('express');

exports.local = passport.use(new LocalStrategy(User.authenticate()));//passport using a new instance of local strategy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {
    console.log(user);
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 })//generating a token using the user._id, secret key and setting it to expire in one hour
}

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//accepting the token from the request header for authentication, once user sign up
opts.secretOrKey = config.secretKey;

////passport using a new instance of jwt strategy
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

//using facebook strategy
exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {

                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', { session: false });//When a user is authenticated based on above strategy, Passport will load a user property to the req object
//verifying if the user is an admin
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    }
    else {
        const err = new Error("You are not authorized to perform this operation");
        res.statusCode = 403;
        return next(err)
    }
}


