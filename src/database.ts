import * as process from "process";
import { createConnection, Connection } from "typeorm";

import { User } from "./entity/User";

let connection: Connection | null;

const {
  TYPEORM_HOST,
  TYPEORM_PORT,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_DATABASE
} = process.env;

export async function getConnection() {
  if (connection == null) {
    connection = await createConnection({
      type: "mysql",
      host: TYPEORM_HOST,
      port: parseInt(TYPEORM_PORT || "3306"),
      username: TYPEORM_USERNAME,
      password: TYPEORM_PASSWORD,
      database: TYPEORM_DATABASE,
      entities: [User],
      synchronize: true,
      logging: false
    });
  }

  return connection;
}
