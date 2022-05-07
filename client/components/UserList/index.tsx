import { useQuery } from "@apollo/client";
import { GET_USERS } from "../../graphql/operations";
import { User, UsersData } from "../../types";

const UserItem = ({ user }: { user: User }) => (
  <div>
    {user.id} - {user.name}
  </div>
);

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
