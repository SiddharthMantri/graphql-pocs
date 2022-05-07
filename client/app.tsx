import { ApolloProvider } from "@apollo/client";
import apolloClient from "./apollo/client";
import BookList from "./components/BookList";
import UserList from "./components/UserList";

const App = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <h1>
        Welcome to React App thats build using Webpack and Babel separately
      </h1>
      <h4>Rendering Books through gateway</h4>
      <BookList />
      <h4>Rendering Users through gateway</h4>
      <UserList />
    </ApolloProvider>
  );
};

export default App;
