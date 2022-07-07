import { DocumentNode, printSchema } from "graphql";
import { GraphQLSchema } from "graphql/type";
import { makeExecutableSchema } from "graphql-tools";
import { gql } from "graphql-tag";

type makeSubscriptionSchemaArgs = {
  gatewaySchema: GraphQLSchema;
  typeDefs: DocumentNode;
  resolvers;
};

const makeSubscriptionSchema = ({
  gatewaySchema,
  typeDefs,
  resolvers,
}: makeSubscriptionSchemaArgs) => {
  const gatewayTypeDefs = gatewaySchema
    ? gql(printSchema(gatewaySchema))
    : undefined;
  return makeExecutableSchema({
    typeDefs: [
      ...((gatewayTypeDefs && [gatewayTypeDefs]) as DocumentNode[]),
      typeDefs,
    ],
    resolvers,
  });
};

export default makeSubscriptionSchema;
