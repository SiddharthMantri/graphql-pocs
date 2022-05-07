import { ApolloServer, gql } from "apollo-server-express";
import { createServer } from "http";

import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";
import express from "express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
const BOOK_CREATED = "BOOK_CREATED";

const typeDefs = gql`
  type Book {
    id: ID!
    name: String
  }

  type Query {
    book: Book
  }

  type Subscription {
    bookCreated: Book
  }
`;

const resolvers = {
  Query: {
    book: () => ({ id: 1, name: "Sid" }),
  },
  Subscription: {
    bookCreated: {
      subscribe: () => pubsub.asyncIterator([BOOK_CREATED]),
    },
  },
};

const server = async () => {
  const app = express();
  let currentNumber = 0;

  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  app.get("/createBook", (_, res) => {
    currentNumber++;
    const payload = {
      id: currentNumber.toString(),
      name: `Book-${currentNumber}`,
    };
    pubsub.publish(BOOK_CREATED, {
      bookCreated: payload,
    });
    res.status(200).json(payload);
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer(
    {
      schema,
    },
    wsServer
  );

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  console.log(wsServer.address());
  httpServer.listen(9100, () => {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${9100}${
        apolloServer.graphqlPath
      }`
    );
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${9100}${
        apolloServer.graphqlPath
      }`
    );
  });

  return httpServer;
};

export default server;
