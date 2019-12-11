import { User } from './entity/User';
import { getConnection } from './database';

export async function getUser(userId: User['id']) {
    const connection = await getConnection();
    return connection.getRepository(User).findOne(userId);
}
