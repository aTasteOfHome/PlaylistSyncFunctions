'use strict';
const SpotifyWebApi = require('spotify-web-api-node');
const router = require('express').Router();
const request = require('request');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const { db } = require('./db');
// const logger = require('./logger');

const spotifyClient = new class SpotifyClient {
    constructor() {
        const kind = 'account-auth';
        const name = 'spotify';
        this.authInfoKey = db.key([kind, name]);

        router.get('/auth', (req, res, next) => {
            console.log('First step to authenticating spotify; check if we\'re already logged in');
            console.log('Request method:', req.method, 
                '\n URL: ', req.originalUrl,
                '\nparams: ', req.params,
                '\nrequest body: ', req.body
            );
            //TODO: check that we're already logged in somehow, and abort auth if so
            db.get(this.authInfoKey, (err, entity) => {
                if (err) {
                    console.warn('Could not find authInfo; First time logging into Spotify');
                    res.redirect('/authLogin');
                    return;
                }
                //TODO: check the tokens and expires in
                //data structure:
                /*
                { 
                    refreshToken: 'some_token', 
                    accessToken: 'some_token', 
                    expiresIn: 3600, 
                    [Symbol(KEY)]: Key { 
                        namespace: undefined, 
                        name: 'spotify', 
                        kind: 'account-auth', 
                        path: [Getter] 
                    } 
                }
                */
               console.log(entity);
                if (entity.expiresAt < new Date().getTime()) {
                    console.log('auth token is still valid');
                    res.send('OK');
                    return;
                } else {
                    //TODO: add security around datastore because of indefinite refresh tokens
                    //TODO: add security and OAuth, etc. around cloud function to prevent random people from pinging it and getting my refresh tokens
                    //TODO: delete old project and make new one to generate new URLs
                    //TODO: add get requests for profile info to test auth tokens
                    request.post('https://accounts.spotify.com/api/token')
                        .on('response', response => {
                            console.log('Got refresh token response from spotify!');
                            console.log(response);
                            let {access_token, token_type, scope, expires_in} = response;
                            spotifyClient.init(access_token, spotifyClient.refreshToken, expires_in);
                        })
                        .on('error', err => {
                            console.error(err);
                            res.redirect('fail');
                        });
                    return;
                }
            });
        });
        router.get('/authLogin', passport.authenticate('spotify'), (req, res) => {
            /*
                The request will be redirected to spotify for authentication, so this
                function will not be called.
            */
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

    init(accessToken, refreshToken, expiresIn , profile) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken || this.refreshToken;
        this.expiresIn = expiresIn || this.expiresIn;
        this.expiresAt = new Date().getTime() + expiresIn * 1000;
        this.profile = profile || this.profile;
        this.api = new SpotifyWebApi({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            redirectUri: process.env.REDIRECT_URI
        });
        console.log('Spotify auth completed successfully!');
        this.setAuthInfo(accessToken, refreshToken, this.expiresAt);
    }
    setAuthInfo(accessToken, refreshToken, expiresAt) {
        this.api.setAccessToken(accessToken);
        const kind = 'account-auth';
        const name = 'spotify';
        const key = db.key([kind, name]);
        const dataToSave = {
            key,
            data: {
                accessToken,
                refreshToken,
                expiresAt
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

    ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();

        console.warn('Request was not authenticated');
        res.redirect('/fail');
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