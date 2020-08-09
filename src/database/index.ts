import * as process from 'process';
import { createConnection, Connection } from 'typeorm';

import { AuthProviderUser } from '../entity/AuthProviderUser';
import { Book } from '../entity/Book';
import { Review } from '../entity/Review';
import { User } from '../entity/User';
import { Revision } from '../entity/Revision';

let connection: Connection | null;

const {
    TYPEORM_HOST,
    TYPEORM_PORT,
    TYPEORM_USERNAME,
    TYPEORM_PASSWORD,
    TYPEORM_DATABASE,
    TYPEORM_SYNCHRONIZE,
} = process.env;

export async function getConnection() {
    if (connection == null) {
        connection = await createConnection({
            type: 'mysql',
            host: TYPEORM_HOST,
            port: parseInt(TYPEORM_PORT || '3306'),
            username: TYPEORM_USERNAME,
            password: TYPEORM_PASSWORD,
            database: TYPEORM_DATABASE,
            entities: [AuthProviderUser, Book, Review, User, Revision],
            synchronize: TYPEORM_SYNCHRONIZE === 'true',
            logging: true,
        });
    }

    return connection;
}
