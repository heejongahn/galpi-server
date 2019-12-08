import { Handler, APIGatewayEvent } from 'aws-lambda';
import verifyFirebaseIdToken from '../../utils/auth/firebase';
import { getConnection } from '../../database';
import { User } from '../../entity/User';
import { AuthProviderUser, AuthProviderType } from '../../entity/AuthProviderUser';

const index: Handler<APIGatewayEvent> = async (event, context) => {
    try {
        const parsedBody = JSON.parse(event.body || 'null');

        if (parsedBody == null || parsedBody.email == null || parsedBody.token == null) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'registerWithFirebase: `email` and `token` is required.',
                }),
            };
        }

        const verifyResult = await verifyFirebaseIdToken(parsedBody.token);

        if (!verifyResult.success) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: verifyResult.reason,
                }),
            };
        }

        const connection = await getConnection();
        const userRepository = connection.getRepository(User);
        const authProviderUserRepository = connection.getRepository(AuthProviderUser);

        const authProviderUser = new AuthProviderUser();
        authProviderUser.providerType = AuthProviderType.firebase;
        authProviderUser.providerId = verifyResult.token;

        const insertedAuthProviderUser = await authProviderUserRepository.save(authProviderUser);

        const user = new User();
        user.email = parsedBody.email;
        user.authProviderUsers = [insertedAuthProviderUser];
        const insertedUser = await userRepository.save(user);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: insertedUser.id,
            }),
        };
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'registerWithFirebase: body is malformed.',
            }),
        };
    }
};

export default index;
