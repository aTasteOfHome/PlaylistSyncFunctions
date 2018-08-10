'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const router = require('express').Router();
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
// const logger = require('./logger');

const spotifyClient = new class SpotifyClient {
    constructor() {
        router.get('/auth', passport.authenticate('spotify'), (req, res) => {
            console.log('First step to authenticating spotify');
            console.log('Request method:', req.method, 
                '\n URL: ', req.originalUrl,
                '\nparams: ', req.params,
                '\nrequest body: ', req.body
            );
        });
        router.get('/authCb', passport.authenticate('spotify', { failureRedirect: '/fail'}), 
        (req, res) => {
            //TODO: don't redirect, send back access token somehow (maybe do that in the passport.use callback?)
            // res.redirect('/pass');
            console.log('spotify/authCb called!');
            console.log('Received request.\nMethod:', req.method, 
                '\n URL: ', req.originalUrl,
                '\nparams: ', req.params,
                '\nrequest body: ', req.body
            );
            //code is in the url; parse it out, then hit spotify's servers to get the accesstoken
        });

        this.router = router;
    }

    init(accessToken, refreshToken, expiresIn, profile) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.profile = profile;
        this.api = new SpotifyWebApi({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URI
        });
        console.log('Spotify auth completed successfully!');
        this.api.setAccessToken(accessToken);
    }
}();

passport.use(new SpotifyStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI
}, (accessToken, refreshToken, expiresIn, profile, done) => {
    console.log('Spotify authorized!');
    console.log('blay ', accessToken);
    //TODO: save accessToken to cloud datastore
    spotifyClient.init(accessToken, refreshToken, expiresIn, profile);
    return done(null, profile);
}));

module.exports = spotifyClient;