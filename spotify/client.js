'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const router = require('express').Router();
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const config = require('../config');
const logger = require('../logger');

const spotifyClient = new class SpotifyClient {
    constructor() {
        router.get('/auth', passport.authenticate('spotify'), (req, res) => {});
        router.get('/authCb', passport.authenticate('spotify', { failureRedirect: '/fail'}), 
        (req, res) => {
            res.redirect('/pass');
        });

        this.router = router;
        this.config = config.Spotify;
    }

    init(accessToken, refreshToken, expiresIn, profile) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.profile = profile;
        this.api = new SpotifyWebApi({
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            redirectUri: this.config.redirectUri
        });
        logger.debug('Spotify auth completed successfully!');
        this.api.setAccessToken(accessToken);
    }
}();

passport.use(new SpotifyStrategy({
    clientID: config.Spotify.clientId,
    clientSecret: config.Spotify.clientSecret,
    callbackURL: config.Spotify.redirectUri
}, (accessToken, refreshToken, expiresIn, profile, done) => {
    spotifyClient.init(accessToken, refreshToken, expiresIn, profile);
    return done(null, profile);
}));

module.exports = spotifyClient;