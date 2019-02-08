require('dotenv').config();

import path from 'path';
import * as winston from 'winston';
import * as fs from 'fs';

import * as rotate from 'winston-daily-rotate-file';

const dir = path.join(__dirname, process.env.LOG_FILE_DIR);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const logger = new winston.Logger({
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

export default logger;
