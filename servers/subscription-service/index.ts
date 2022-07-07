import { ApolloServer, gql } from "apollo-server-express";
import { createServer } from "http";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";
import express from "express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import { ApolloGateway } from "@apollo/gateway";
import {
  execute,
  getOperationAST,
  GraphQLError,
  parse,
  subscribe,
  validate,
} from "graphql";
import makeSubscriptionSchema from "../utils/makeSubscriptionSchema";
import LiveUpdatesDatasource from "./liveUpdatesDatasource";

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
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    book: () => ({ id: 1, name: "Sid" }),
  },
  Subscription: {
    books: {
      subscribe: () => pubsub.asyncIterator([BOOK_CREATED]),
      resolve: (payload, args, { dataSources: { gatewayApi } }, info) =>
        gatewayApi.fetchAndMergeNonPayloadPostData(
          payload.books[0].id,
          payload,
          info
        ),
    },
  },
};

const server = async () => {
  // @ts-ignore
  let schema;
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

  gateway.onSchemaLoadOrUpdate((schemaContext) => {
    schema = makeSubscriptionSchema({
      gatewaySchema: schemaContext.apiSchema,
      typeDefs,
      resolvers,
    });
  });

  await gateway.load();

  let currentNumber = 0;

  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  app.get("/createBook", (_, res) => {
    currentNumber += 1;
    const payload = {
      id: currentNumber.toString(),
      name: `Book-${currentNumber}`,
    };
    pubsub.publish(BOOK_CREATED, {
      books: [payload],
    });
    res.status(200).json(payload);
  });

  // Unique case of having to disable eslint 👀
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const serverCleanup = useServer(
    {
      execute,
      subscribe,
      context: (ctx) => {
        const liveUpdatesDatasource = new LiveUpdatesDatasource(
          process.env.GATEWAY_URL
        );
        liveUpdatesDatasource.initialize({
          context: ctx,
          cache: undefined,
        });

        const dataSourceContext = {
          dataSources: {
            gatewayApi: liveUpdatesDatasource,
          },
        };
        return {
          ...dataSourceContext,
        };
      },
      onSubscribe: (_ctx, msg) => {
        const args = {
          schema,
          operationName: msg.payload.operationName,
          document: parse(msg.payload.query),
          variableValues: msg.payload.variables,
        };

        const operationAST = getOperationAST(args.document, args.operationName);

        if (!operationAST) {
          return [new GraphQLError("Unable to identify operation")];
        }

        if (operationAST.operation !== "subscription") {
          return [
            new GraphQLError("Only subscription operations are supported"),
          ];
        }

        // Validate the operation document
        const errors = validate(args.schema, args.document);

        if (errors.length > 0) {
          return errors;
        }

        return args;
      },
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

  return httpServer;
};

export default server;
