import { useQuery } from "@apollo/client";
import { GET_BOOKS } from "../../graphql/operations";
import { Book, BooksData } from "../../types";

export const BookItem = ({ book }: { book: Book }) => (
  <div>
    {book.id} - {book.name}
  </div>
);

const BookList = (): JSX.Element => {
  const { data, loading } = useQuery<BooksData>(GET_BOOKS);
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

export default BookList;
