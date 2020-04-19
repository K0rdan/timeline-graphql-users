import { ApolloServer, Config, gql } from 'apollo-server-micro';
import { buildFederatedSchema } from '@apollo/federation';
import { schemaComposer } from 'graphql-compose';
import './dataModel';

const typeDefs = schemaComposer.toSDL({
  exclude: ['Boolean', 'String', 'ID'],
});
const resolvers = schemaComposer.getResolveMethods({
  exclude: ['Boolean', 'String', 'ID'],
});

const options: Config = {
  schema: buildFederatedSchema({ typeDefs: gql(typeDefs), resolvers }),
  engine: {
    apiKey: 'service:timeline-users:67l6GYHn8qIbadnBYP7qZQ',
    schemaTag: 'production',
  },
};

const server = new ApolloServer(options);
module.exports = server.createHandler();
