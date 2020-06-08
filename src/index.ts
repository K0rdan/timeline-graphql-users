import { ApolloServer, Config, gql } from 'apollo-server-micro';
import { buildFederatedSchema } from '@apollo/federation';
import { schemaComposer } from 'graphql-compose';
import { ValidationContext /* FieldNode, GraphQLError */ } from 'graphql';

import mongos from './mongos';
import logger from './logger';
import './dataModel';

const { NODE_ENV, APOLLO_KEY, APOLLO_ENGINE_SCHEMA_TAG } = process.env;

const graphQLValidationRules: Array<(context: ValidationContext) => any> = [];
// graphQLValidationRules.push((context) => {
//   return {
//     Field(node: FieldNode) {
//       if (node.name.value === '__schema' || node.name.value === '__type') {
//         context.reportError(
//           new GraphQLError('GraphQL introspection is not allowed', [node]),
//         );
//       }
//     },
//   };
// });

export default mongos
  .init()
  .then((results) => {
    // Initialization error handling
    if (results.findIndex((r) => r.status === 'rejected') !== -1) {
      logger.error('Cannot start the server due to mongo errors...');
      process.exit();
    }

    const typeDefs = schemaComposer.toSDL({
      exclude: ['Boolean', 'String', 'ID'],
    });
    const resolvers = schemaComposer.getResolveMethods({
      exclude: ['Boolean', 'String', 'ID'],
    });

    const options: Config = {
      schema: buildFederatedSchema({ typeDefs: gql(typeDefs), resolvers }),
      debug: NODE_ENV === 'development',
      playground: NODE_ENV === 'development',
      subscriptions: false,
      engine: {
        apiKey: APOLLO_KEY,
        graphVariant: APOLLO_ENGINE_SCHEMA_TAG,
      },
      validationRules: graphQLValidationRules,
      logger,
    };

    const server = new ApolloServer(options);
    return server.createHandler({
      onHealthCheck: () =>
        new Promise((resolve, reject) =>
          mongos.isConnectedToUsers() ? resolve() : reject(),
        ),
    });
  })
  .catch((err) => {
    logger.error(`Can't start the server...`, err);
    process.exit();
  });
