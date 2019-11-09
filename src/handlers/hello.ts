import { Handler } from "aws-lambda";
import { User } from "../entity/User";
import { getConnection } from "../database";

const index: Handler = async (event, context) => {
  const connection = await getConnection();
  console.log("Inserting a new user into the database...");
  const user = new User();
  user.displayName = "abc";
  await connection.manager.save(user);
  console.log("Saved a new user with id: " + user.id);

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: Math.floor(Math.random() * 10)
    })
  };

  return response;
};

export default index;
