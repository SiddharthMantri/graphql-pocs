import { gql, useQuery } from "@apollo/client";

const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      name
    }
  }
`;
interface Book {
  id: number;
  name: string;
}

interface BooksData {
  books: Book[];
}

const BookItem = ({ book }: { book: Book }) => {
  return (
    <div>
      {book.id} - {book.name}
    </div>
  );
};

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
