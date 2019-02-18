require('dotenv').config();

import * as path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import socketIO from 'socket.io';
import logger from './core/logger/app-logger';
import dbConnection from './db/connect';
import authMiddleware from './core/middleware/auth';
import defaultRoute from './routes/default.route';
import exampleRoute from './routes/example.route';


const port = process.env.SERVER_PORT;
logger.stream = {
  write(message, encoding) {
    // logger.info(`${message} - ${encoding !== undefined ? encoding.toString() : ''}`);
  },
};

dbConnection();

const app = express();

const server = http.createServer(app);
const io = socketIO(server);
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev', { stream: logger.stream }));

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(authMiddleware);

const defaultRouter = defaultRoute(router, io);
const exampleRouter = exampleRoute(router, io);

app.use(router);

server.listen(port, () => {
  logger.info(`Server started - ${port}`, 1);
});
