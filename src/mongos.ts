import mongoose from 'mongoose';
import Logger, { addMongoLogTransport } from './logger';

const {
  MONGO_POOL_SIZE,
  MONGO_USERS_URL,
  MONGO_USERS_PORT,
  MONGO_USERS_COLLECTION,
  MONGO_LOGS_URL,
  MONGO_LOGS_PORT,
  MONGO_LOGS_COLLECTION,
} = process.env;

const mongooseDefaultConnectionOptions = {
  poolSize:
    typeof MONGO_POOL_SIZE === 'string'
      ? parseInt(MONGO_POOL_SIZE, 10)
      : MONGO_POOL_SIZE,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

const mongoConnectionPool = [
  mongoose.createConnection(
    `${MONGO_LOGS_URL}:${MONGO_LOGS_PORT}/${MONGO_LOGS_COLLECTION}`,
    {
      ...mongooseDefaultConnectionOptions,
    },
  ),
  mongoose.createConnection(
    `${MONGO_USERS_URL}:${MONGO_USERS_PORT}/${MONGO_USERS_COLLECTION}`,
    {
      ...mongooseDefaultConnectionOptions,
    },
  ),
];

export const init = async () =>
  await Promise.allSettled(mongoConnectionPool).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        Logger.error(
          `Connection to MongoDB{${mongoConnectionPool[index].name}} raised an error...`,
        );
      } else if (
        result.status === 'fulfilled' &&
        result.value.readyState === 1
      ) {
        Logger.info(
          `Connection to MongoDB{${result.value.name}} established ! 🚀`,
        );

        if (
          mongoConnectionPool[index].name === MONGO_LOGS_COLLECTION &&
          isConnectedToLogs()
        ) {
          addMongoLogTransport(mongoConnectionPool[index]);
        }
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
  isConnected(MONGO_USERS_COLLECTION);
export const isConnectedToLogs = (): Boolean =>
  isConnected(MONGO_LOGS_COLLECTION);

export const Mongos = {
  init,
  isConnected,
  isConnectedToUsers,
  isConnectedToLogs,
};
export default Mongos;
