export interface Book {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
}

export interface BooksData {
  books: Book[];
}
export interface UsersData {
  users: User[];
}
