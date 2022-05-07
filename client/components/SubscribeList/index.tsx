import { useQuery } from "@apollo/client";
import { BooksData } from "../../types";
import { useEffect } from "react";
import { GET_BOOKS, SUBSCRIBE_BOOKS } from "../../graphql/operations";
import { BookItem } from "../BookList";

const SubscribeList = () => {
  const { data, subscribeToMore, loading } = useQuery<BooksData>(GET_BOOKS);

  useEffect(() => {
    const unsub = subscribeToMore({
      document: SUBSCRIBE_BOOKS,
      updateQuery: (previous, { subscriptionData }) => {
        if (!subscriptionData) {
          return previous;
        }
        return {
          // @ts-ignore
          books: [...previous.books, subscriptionData.data.bookCreated],
        };
      },
    });
    return () => unsub();
  }, [subscribeToMore]);

  if (loading) {
    return <h5>Loading...</h5>;
  }

  return (
    <>
      {data.books.map((book) => (
        <BookItem book={book} key={book.id} />
      ))}
    </>
  );
};

export default SubscribeList;
