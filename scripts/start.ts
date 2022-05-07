import bookServer from "../servers/books-service";
import userServer from "../servers/user-service";
import gateway from "../servers/gateway";
import subscriptionService from "../servers/subscription-service";

const start = async () => {
  const booksApp = await bookServer();
  booksApp.listen(8080);
  console.log("Started books");

  const usersApp = await userServer();
  usersApp.listen(8090);
  console.log("Started users");

  const gatewayApp = await gateway();
  gatewayApp.listen(9000);
  console.log("Started gateway");

  const subscriptionApp = await subscriptionService();
  subscriptionApp.listen(9100);
  console.log("started subscription service");
};

start();
