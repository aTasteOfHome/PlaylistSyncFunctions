'use strict';
const _ = require('lodash');
const config = require('./config');

exports.port = 9999;

exports.Spotify = {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: `http://localhost:${exports.port}/spotify/authCb`
};