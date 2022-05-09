import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const createWsLink = ({ wsUrl }: { wsUrl: string }) =>
  new GraphQLWsLink(
    createClient({
      url: wsUrl,
    })
  );

export default createWsLink;
