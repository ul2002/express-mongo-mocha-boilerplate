import Mongoose from 'mongoose';
import logger from '../core/logger/app-logger';
import { DB_CONNECTION_SUCCESS } from '../core/utils/constants';

Mongoose.Promise = global.Promise;

const dbConnection = async () => {
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPswd = process.env.DB_PASSWORD;

  try {
    if (dbUser.length === 0 || dbPswd.length === 0) {
      await Mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`, { useMongoClient: true });
    } else {
      await Mongoose.connect(`mongodb://${dbUser}:${dbPswd}@${dbHost}:${dbPort}/${dbName}`, { useMongoClient: true });
    }
    logger.info(DB_CONNECTION_SUCCESS, 1);
  } catch (err) {
    logger.error(err.stack);
  }
};

export default dbConnection;
