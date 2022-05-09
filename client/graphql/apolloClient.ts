import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import createHttpLink from "./links/httpLink";
import createWsLink from "./links/wsLink";
import config from "../config";

const { wsUrl, gatewayUrl } = config;

const wsLink = createWsLink({ wsUrl });
const httpLink = createHttpLink({ gatewayUrl });

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
