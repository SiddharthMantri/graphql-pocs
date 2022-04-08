import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import express from "express";
import { buildSubgraphSchema } from "@apollo/subgraph";

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    name: String
  }

  extend type Query {
    users: [User]
    user(userId: ID!): User
  }
`;

const resolvers = {
  Query: {
    users: () => {
      return [
        {
          id: 1,
          name: "Sid",
        },
        {
          id: 2,
          name: "Ana",
        },
      ];
    },
    user: (parent, args, context) => {
      const { userId } = args;
      if (userId) {
        return {
          id: 1,
          name: "Sid",
        };
      }
      return null;
    },
  },
  User: {
    __resolveReference() {
      return {
        id: 1,
        name: "Sid",
      };
    },
  },
};

const server = async () => {
  const app = express();

  const schema = buildSubgraphSchema({ typeDefs, resolvers });

  const apolloServer = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  return app;
};

export default server;
