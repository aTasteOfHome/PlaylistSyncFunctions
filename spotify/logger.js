// 'use strict';
// const fs = require('fs');
// const winston = require('winston');
// const { combine, timestamp, label, printf, colorize } = winston.format;

// const myFormat = printf(
//     info => `${info.timestamp} [${info.label}] [${info.level.toLocaleUpperCase()}]: ${info.message}`
// );
// const logger = winston.createLogger({
//     format: combine(
//         label({label: 'PlaylistSyncServer'}),
//         timestamp(),
//         myFormat
//     ),
//     transports: [
//         new winston.transports.Console({level: 'debug'})
//     ]
// });

// /*
// Log levels:
// logger.debug
// logger.info
// logger.warn
// logger.error
// */

// module.exports = logger;