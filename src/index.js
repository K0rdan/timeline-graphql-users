const { ApolloServer } = require('apollo-server-micro');
const { buildFederatedSchema } = require('@apollo/federation');
const gql = require('graphql-tag');

const typeDefs = gql`
  type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return { id: '1', username: '@ava' };
    },
  },
  User: {
    __resolveReference(user, { fetchUserById }) {
      return fetchUserById(user.id);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema({ typeDefs, resolvers }),
  engine: true,
  reporting: false,
});

module.exports = server.createHandler();
