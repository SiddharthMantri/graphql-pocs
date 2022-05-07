import { HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "http://localhost:9000/graphql",
});

export default httpLink;
