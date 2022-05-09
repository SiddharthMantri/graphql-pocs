import dotenv from "dotenv";
import bookServer from "../servers/books-service";
import userServer from "../servers/user-service";
import gateway from "../servers/gateway";
import subscriptionService from "../servers/subscription-service";

dotenv.config();

const start = async () => {
  const { BOOKS_PORT, USERS_PORT, GATEWAY_PORT, WS_PORT } = process.env;
  const booksApp = await bookServer();
  booksApp.listen(BOOKS_PORT);
  console.log("Started books");

  const usersApp = await userServer();
  usersApp.listen(USERS_PORT);
  console.log("Started users");

  const gatewayApp = await gateway();
  gatewayApp.listen(GATEWAY_PORT);
  console.log("Started gateway");

  const subscriptionApp = await subscriptionService();
  subscriptionApp.listen(WS_PORT);
  console.log("started subscription service");
};

start();
