import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import httpLink from "./links/httpLink";
import wsLink from "./links/wsLink";

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

export default apolloClient;
