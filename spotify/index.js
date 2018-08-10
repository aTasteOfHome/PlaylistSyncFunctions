'use strict';

const express = require('express');
const SpotifyClient = require('./client');
const passport = require('passport');
const app = express();
// const logger = require('./logger');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((obj, done) => done(null, obj));

app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/fail', (req, res) => {
  console.error('Something failed');
  console.error('%o', res);
  res.send('Stuff failed');
});
app.get('/pass', (req, res) => {
  console.log('Something passed');
  console.log('%o', res);
  res.send('Stuff passed!');
});
app.use('/api', SpotifyClient.router);

app.listen(3000);
console.log(`Listening on port ${3000}...`);


module.exports.run = (req, res) => {
  if (!req.path) {
    req.url = `/${req.url}`; // prepend '/' to keep query params if any
  }
    
    console.log('Received request.\nMethod:', req.method, 
        '\n URL: ', req.originalUrl,
        '\nparams: ', req.params,
        '\nrequest body: ', req.body
    );
    return app(req, res);
};