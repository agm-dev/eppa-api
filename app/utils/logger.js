// requires:
const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');
require('dotenv').config();

// variables:
const logDir = process.env.LOG_DIR || 'log';
const logLevel = process.env.LOG_LEVEL || 'error';
const logName = process.env.APP_NAME ? process.env.APP_NAME.toLowerCase() : 'app';
const tsFormat = () => (new Date()).toLocaleTimeString();

// create the log directory if it does not exist:
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// log files transport:
const logFileTransport = new (winston.transports.DailyRotateFile)({
  filename: `${logDir}/-${logName}.log`,
  timestamp: tsFormat,
  datePattern: 'yyyy-MM-dd',
  prepend: true,
  level: logLevel,
});

// logger instance, config and export
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      level: logLevel
    }),
    logFileTransport,
  ]
});

module.exports = logger;