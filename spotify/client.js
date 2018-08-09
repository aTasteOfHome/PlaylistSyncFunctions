'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const router = require('express').Router();
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const logger = require('./logger');

const spotifyClient = new class SpotifyClient {
    constructor() {
        router.get('/auth', passport.authenticate('spotify'), (req, res) => {
            logger.debug('First step to authenticating spotify');
            logger.debug('Request:');
            logger.debug(req);
            logger.debug('Response:');
            logger.debug(res);
        });
        router.get('/authCb', passport.authenticate('spotify', { failureRedirect: '/fail'}), 
        (req, res) => {
            res.redirect('/pass');
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
        logger.debug('Spotify auth completed successfully!');
        this.api.setAccessToken(accessToken);
    }
}();

passport.use(new SpotifyStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI
}, (accessToken, refreshToken, expiresIn, profile, done) => {
    spotifyClient.init(accessToken, refreshToken, expiresIn, profile);
    return done(null, profile);
}));

module.exports = spotifyClient;