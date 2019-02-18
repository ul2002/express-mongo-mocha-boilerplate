require('dotenv').config();

import path from 'path';
import * as fs from 'fs';
import * as winston from 'winston';
import * as rotate from 'winston-daily-rotate-file';

const dir = path.join(__dirname, process.env.LOG_FILE_DIR);

const request = require("request");
const uuidv4 = require('uuid/v4');

const app_version = process.env.APP_VERSION;
const app_name = process.env.APP_NAME;
const logger_host = process.env.LOGGER_HOST;
const logger_port = process.env.LOGGER_PORT;
const logger_user = process.env.LOGGER_USER;
const logger_password = process.env.LOGGER_PASSWORD;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}


const logger = {};

const winston_logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)({
      colorize: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: process.env.LOG_FILE_NAME,
      dirname: dir,
      maxsize: 20971520, // 20MB
      maxFiles: 25,
      datePattern: '.dd-MM-yyyy',
    }),
  ],
});

const errHandler = function(err) {
    console.log(err);
}

const initialize =  () => {
    // Setting URL and headers for request
    var options = {
        url: `${logger_host}:${logger_port}/_session`,
        headers: {
            'User-Agent': 'request'
        },
        form: { 
          name: logger_user,
          password: logger_password
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
      // Do async job
        request.post(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                let cookies = resp.headers['set-cookie'][0].split(";")
                resolve(cookies[0]);

            }
        })
    })

}

logger.write =  (level, message,cookie) => {
    // Setting URL and headers for request
    var options = {
        url: `${logger_host}:${logger_port}/acra-storage/_design/acra-storage/_update/report`,
        headers: {
            'User-Agent': 'request',
            'Cookie': cookie 
        },
        json: { 
          APP_VERSION: app_version,
          APP_NAME: app_name,
          LEVEL: level,
          REPORT_ID: uuidv4(),
          STACK_TRACE: message
        }
    };
    // Return new promise 
    return new Promise(function(resolve, reject) {
      // Do async job
        request.put(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);

            }
        })
    })

}

logger.error =  (message, onlywinston = 0) => {
        if (!onlywinston) {
            initialize().then(function(cookie) {
                      logger.write('error',message,cookie)
          });   
        }

        winston_logger.error(message);   
};

logger.info =  (message, onlywinston = 0) => {
        if (!onlywinston) {
            initialize().then(function(cookie) {
                      logger.write('info',message,cookie)
          });   
        }

        winston_logger.info(message); 
};

export default logger;