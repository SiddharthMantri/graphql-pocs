import { HttpLink } from "@apollo/client";

const createHttpLink = ({ gatewayUrl }: { gatewayUrl: string }) =>
  new HttpLink({
    uri: gatewayUrl,
  });

export default createHttpLink;
