import { gql, useQuery } from "@apollo/client";

const GET_USERS = gql`
  query GetBooks {
    users {
      id
      name
    }
  }
`;
interface User {
  id: number;
  name: string;
}

interface UsersData {
  users: User[];
}

const UserItem = ({ user }: { user: User }) => {
  return (
    <div>
      {user.id} - {user.name}
    </div>
  );
};

const UserList = (): JSX.Element => {
  const { data, loading } = useQuery<UsersData>(GET_USERS);
  if (loading) {
    return <h5>Loading...</h5>;
  }
  return (
    <>
      {data.users.map((user) => (
        <UserItem user={user} key={user.id} />
      ))}
    </>
  );
};

export default UserList;
