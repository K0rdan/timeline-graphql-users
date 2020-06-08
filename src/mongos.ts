import mongoose from 'mongoose';
import { addMongoLogTransport, logger } from './logger';

const {
  MONGO_POOL_SIZE,
  MONGO_USERS_URL,
  MONGO_USERS_PORT,
  MONGO_USERS_DATABASE,
  MONGO_LOGS_URL,
  MONGO_LOGS_PORT,
  MONGO_LOGS_DATABASE,
} = process.env;

const mongooseDefaultConnectionOptions: mongoose.ConnectionOptions = {
  poolSize:
    typeof MONGO_POOL_SIZE === 'string'
      ? parseInt(MONGO_POOL_SIZE, 10)
      : MONGO_POOL_SIZE,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  autoCreate: true,
};

const mongoConnectionPool = [
  mongoose.createConnection(
    `${MONGO_LOGS_URL}:${MONGO_LOGS_PORT}/${MONGO_LOGS_DATABASE}`,
    {
      ...mongooseDefaultConnectionOptions,
    },
  ),
  mongoose.createConnection(
    `${MONGO_USERS_URL}:${MONGO_USERS_PORT}/${MONGO_USERS_DATABASE}`,
    {
      ...mongooseDefaultConnectionOptions,
    },
  ),
];

export const init = async () =>
  await Promise.allSettled(mongoConnectionPool).then((results) => {
    results.forEach((result, index) => {
      const { name, host, port, db } = mongoConnectionPool[index];
      if (result.status === 'rejected') {
        logger.error(
          `Connection to MongoDB{${name}} (${host}:${port}/${db?.databaseName}) raised an error...`,
          result.reason,
        );
      } else if (
        result.status === 'fulfilled' &&
        result.value.readyState === 1
      ) {
        if (name === MONGO_LOGS_DATABASE && isConnectedToLogs()) {
          addMongoLogTransport(mongoConnectionPool[index]);
        }

        logger.info(
          `Connection to MongoDB{${name}} (${host}:${port}/${db?.databaseName}) established ! 🚀`,
        );
      }
    });
    return results;
  });

export const isConnected = (connectionName: String): Boolean => {
  const connection = mongoose.connections.find(
    (conn) => conn.name === connectionName,
  );
  if (connection && connection.readyState === 1) {
    return true;
  }
  return false;
};
export const isConnectedToUsers = (): Boolean =>
  isConnected(MONGO_USERS_DATABASE);
export const isConnectedToLogs = (): Boolean =>
  isConnected(MONGO_LOGS_DATABASE);

export const Mongos = {
  init,
  isConnected,
  isConnectedToUsers,
  isConnectedToLogs,
};
export default Mongos;
