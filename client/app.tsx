import { ApolloProvider } from "@apollo/client";
import apolloClient from "./graphql/apolloClient";
import BookList from "./components/BookList";
import SubscribeList from "./components/SubscribeList";
import UserList from "./components/UserList";

const App = (): JSX.Element => (
  <ApolloProvider client={apolloClient}>
    <h1>
      Welcome to React App connects to Apollo Gateway and Subscriptions
      separately
    </h1>
    <h3>... but renders them together</h3>
    <h4>Rendering Books through gateway</h4>
    <BookList />
    <h4>Rendering Users through gateway</h4>
    <UserList />
    <h4>Rendering Books through subscription</h4>
    <SubscribeList />
  </ApolloProvider>
);

export default App;
