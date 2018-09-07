'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const router = require('express').Router();
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const db = require('./db');
// const logger = require('./logger');

const spotifyClient = new class SpotifyClient {
    constructor() {
        const kind = 'account-auth';
        const name = 'spotify';
        this.authInfoKey = db.key([kind, name]);

        router.get('/auth', (req, res) => {
            console.log('First step to authenticating spotify');
            //check that we're already logged in somehow, and abort auth if so
            console.log('Request method:', req.method, 
                '\n URL: ', req.originalUrl,
                '\nparams: ', req.params,
                '\nrequest body: ', req.body
            );
            db.get(this.authInfoKey, (err, entity) => {
                if (err) {
                    console.error(err);
                    //TODO: figure out how to change response status so it is an error
                    res.send(err);
                }
                //TODO: check the tokens and expires in
                console.log(entity);
                res.redirect('/authLogin');
            });
        });
        router.get('/authLogin', passport.authenticate('spotify'), (req, res) => {
            console.log('First step to authenticating spotify');
            //check that we're already logged in somehow, and abort auth if so
            console.log('Request method:', req.method, 
                '\n URL: ', req.originalUrl,
                '\nparams: ', req.params,
                '\nrequest body: ', req.body
            );
            res.send('login good!');
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
            res.send('login cb good!');
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
        this.setAuthInfo(accessToken, refreshToken, expiresIn);
    }
    setAuthInfo(accessToken, refreshToken, expiresIn) {
        this.api.setAccessToken(accessToken);
        const kind = 'account-auth';
        const name = 'spotify';
        const key = db.key([kind, name]);
        const dataToSave = {
            key,
            data: {
                accessToken,
                refreshToken,
                expiresIn
            }
        };
        console.log('Data to save: %j', dataToSave);
        db.save(dataToSave)
            .then(() => {
                console.log('Saved %j: %j', dataToSave.key, dataToSave.data);
            })
            .catch(err => {
                console.error('Failed to save auth info in Spotify');
                console.error(err);
            });
    }
}();

passport.use(new SpotifyStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI
}, (accessToken, refreshToken, expiresIn, profile, done) => {
    console.log('Spotify authorized!');
    //TODO: save accessToken to cloud datastore
    spotifyClient.init(accessToken, refreshToken, expiresIn, profile);
    return done(null, profile);
}));

module.exports = spotifyClient;