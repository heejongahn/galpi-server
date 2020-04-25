import { Handler, APIGatewayEvent } from 'aws-lambda';
import { verifyFirebaseIdToken } from '../../utils/auth/firebase';
import { getConnection } from '../../database';
import { User } from '../../entity/User';
import { AuthProviderUser, AuthProviderType } from '../../entity/AuthProviderUser';
import { generateUserToken } from '../../utils/auth/token';

const index: Handler<APIGatewayEvent> = async (event, context) => {
    const malformedBodyTokenResponse = {
        statusCode: 400,
        body: JSON.stringify({
            message: `registerWithFirebase: body is malformed.`,
        }),
    };

    const missingTokenResponse = {
        statusCode: 400,
        body: JSON.stringify({
            message: 'registerWithFirebase: `token` is required.',
        }),
    };

    const getSuccessResponse = (user: User) => ({
        statusCode: 200,
        body: JSON.stringify({
            token: generateUserToken(user),
        }),
    });

    const connection = await getConnection();
    const userRepository = connection.getRepository(User);
    const authProviderUserRepository = connection.getRepository(AuthProviderUser);

    try {
        const parsedBody = JSON.parse(event.body || 'null');

        if (parsedBody == null || parsedBody.token == null) {
            return missingTokenResponse;
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

        const existingAuthProviderUser = await authProviderUserRepository.findOne({
            where: {
                providerType: AuthProviderType.firebase,
                providerId: verifyResult.token,
            },
        });

        if (existingAuthProviderUser != null) {
            return getSuccessResponse(existingAuthProviderUser.user);
        }

        const authProviderUser = new AuthProviderUser();
        authProviderUser.providerType = AuthProviderType.firebase;
        authProviderUser.providerId = verifyResult.token;

        const insertedAuthProviderUser = await authProviderUserRepository.save(authProviderUser);

        const user = new User();
        user.email = verifyResult.email;
        user.authProviderUsers = [insertedAuthProviderUser];
        const insertedUser = await userRepository.save(user);

        return getSuccessResponse(insertedUser);
    } catch (e) {
        return malformedBodyTokenResponse;
    }
};

export default index;
