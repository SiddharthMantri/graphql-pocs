import { default as bookServer } from "../books-service";
import { default as userServer } from "../user-service";
import { default as gateway } from "../gateway";
import { default as subs } from "../subscription-service";

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

  const subscriptionApp = await subs();
  console.log("started subs");
};

start();
