## Using Subscriptions with a Federated data graph in a React App

---

A demo project to show how to connect a React client app to two different graphql services and use a graphql subscription alongside a federated data graph.

#### Architecture

For the purpose of this example, these are the services being run:

- A federated subgraph that returns a list of books and extends the book type to include a user. `localhost:8080`
- A federated subgraph that return a list of users. `localhost:8090`
- An apollo gateway server that serves these two subgraphs. `localhost:9000`
- A subscription service that publishes an event whenever a new book is created. `localhost:9100`

These services are queried through an Apollo Client instance in the React app running on `localhost:3000`

#### Start

```sh
# Install deps
yarn

# run the services

yarn start:server # Runs scripts/start.ts
yarn start:client # Starts the webpack dev server
```

Your client app will be served on `http://localhost:3000`. If you then connect to `http://localhost:9100/createBook` in a new tab on your browser, a new pubsub event will be created which will publish data to the exposed subscription which in turn will trigger a re-render of the books on the browser.
