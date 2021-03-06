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
  query GetUsers {
    users {
      id
      name
    }
  }
`;

export const SUBSCRIBE_BOOKS = gql`
  subscription SubscribeBook {
    books {
      id
      name
    }
  }
`;
