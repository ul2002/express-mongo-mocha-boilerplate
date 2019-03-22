require('dotenv').config();

import path from 'path';
import * as fs from 'fs';
import * as winston from 'winston';
import * as rotate from 'winston-daily-rotate-file';

const request = require('request');
const uuidv4 = require('uuid/v4');

const loggerEnable = process.env.LOGGER_ENABLE;
const appVersion = process.env.APP_VERSION;
const appName = process.env.APP_NAME;
const loggerHost = process.env.LOGGER_HOST;
const loggerPort = process.env.LOGGER_PORT;
const loggerUser = process.env.LOGGER_USER;
const loggerPassword = process.env.LOGGER_PASSWORD;
const dir = path.join(__dirname, process.env.LOG_FILE_DIR);


const baseUrl = loggerPort ? `${loggerHost}:${loggerPort}` : `${loggerHost}`;

const logger = {};

const localLogger = new winston.Logger({
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

const errHandler = (err) => {
  console.log(err);
};

const initialize = () => {
  // Setting URL and headers for request
  const options = {
    url: `${baseUrl}/_session`,
    headers: {
      'User-Agent': 'request',
    },
    form: { 
      name: loggerUser,
      password: loggerPassword,
    },
  };
  // Return new promise 
  return new Promise((resolve, reject) => {
    // Do async job
    request.post(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        const cookies = resp.headers['set-cookie'][0].split(';');
        resolve(cookies[0]);
      }
    });
  });
};

logger.write = (level, message, cookie) => {
  // Setting URL and headers for request
  const options = {
    url: `${baseUrl}/acra-storage/_design/acra-storage/_update/report`,
    headers: {
      'User-Agent': 'request',
      Cookie: cookie,
    },
    json: { 
      APP_VERSION: appVersion,
      APP_NAME: appName,
      LEVEL: level,
      REPORT_ID: uuidv4(),
      STACK_TRACE: message,
    },
  };
  // Return new promise 
  return new Promise((resolve, reject) => {
    // Do async job
    request.put(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
};

logger.error = (message) => {
  if (loggerEnable == 'true') {
    initialize().then((cookie) => {
      logger.write('error', (message.stack) ? message.stack : message, cookie);
    });   
  }
  localLogger.error((message.stack) ? message.stack : message);
};

logger.info = (message) => {
  if (loggerEnable == 'true') {
    initialize().then((cookie) => {
      logger.write('info', message, cookie);
    });   
  }
  localLogger.info(message);
};

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

export default logger;
