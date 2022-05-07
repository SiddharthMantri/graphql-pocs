import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import express from "express";
import { buildSubgraphSchema } from "@apollo/subgraph";

const typeDefs = gql`
  type Book @key(fields: "id") {
    id: ID!
    name: String
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    book: Book
  }

  extend type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => {
      return [
        {
          id: 1,
          name: "Harry Potter",
        },
        {
          id: 2,
          name: "Lord of the Rings",
        },
      ];
    },
  },
  Book: {
    __resolveReference(book) {
      console.log(book);
      return {
        id: 1,
        name: "Harry Potter",
      };
    },
  },
  User: {
    book: () => {
      return {
        id: 1,
        name: "Harry Potter",
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
