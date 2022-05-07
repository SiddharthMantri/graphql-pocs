import { gql } from "@apollo/client";

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      name
    }
  }
`;

export const GET_USERS = gql`
  query GetBooks {
    users {
      id
      name
    }
  }
`;

export const SUBSCRIBE_BOOKS = gql`
  subscription SubscribeBook {
    bookCreated {
      id
      name
    }
  }
`;
