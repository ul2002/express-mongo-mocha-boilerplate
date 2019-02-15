require('dotenv').config();

const request = require("request");
const uuidv4 = require('uuid/v4');

const app_version = process.env.APP_VERSION;
const app_name = process.env.APP_NAME;
const logger_host = process.env.LOGGER_HOST;
const logger_port = process.env.LOGGER_PORT;
const logger_user = process.env.LOGGER_USER;
const logger_password = process.env.LOGGER_PASSWORD;

const logger = {};

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

logger.error =  (message) => {
        initialize().then(function(cookie) {
                    logger.write('error',message,cookie)
        });
};

logger.info =  (message) => {
        initialize().then(function(cookie) {
                    logger.write('info',message,cookie)
        });
};

export default logger;