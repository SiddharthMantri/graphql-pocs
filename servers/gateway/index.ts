import { ApolloGateway } from "@apollo/gateway";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";

const server = async () => {
  const app = express();

  const gateway = new ApolloGateway({
    serviceList: [
      {
        name: "Books",
        url: "http://localhost:8080/graphql",
      },
      {
        name: "Users",
        url: "http://localhost:8090/graphql",
      },
    ],
  });

  const apolloServer = new ApolloServer({
    gateway,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  return app;
};

export default server;
