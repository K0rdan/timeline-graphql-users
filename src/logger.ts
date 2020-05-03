import { createLogger, format, transports } from 'winston';
import { MongoDB } from 'winston-mongodb';
import mongoose from 'mongoose';

const { NODE_ENV } = process.env;
const consoleLogTransport = new transports.Console({
  format: format.combine(format.colorize(), format.simple()),
});

export const logger = createLogger({
  defaultMeta: {
    service: 'timeline-graphql-users',
  },
  transports: [consoleLogTransport],
});

export const addMongoLogTransport = (
  mongooseConnection: mongoose.Connection,
) => {
  logger.push(
    // @ts-ignore
    new MongoDB({
      db: mongooseConnection,
    }),
  );
  if (NODE_ENV !== 'development') {
    logger.remove(consoleLogTransport);
  }
};

export default logger;
