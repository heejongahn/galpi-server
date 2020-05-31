import { Handler, APIGatewayEvent } from 'aws-lambda';
import { getUser } from '../../getUser';
import { generateUserTokenPair } from '../../utils/auth/token';
import { identifyUserfromAuthorizationToken } from '../../utils/auth/identify';

const index: Handler<APIGatewayEvent> = async (event) => {
    const { body } = event;

    const unauthorizedResponse = {
        statusCode: 401,
        body: `Unauthorized`,
    };

    try {
        const { refreshToken } = JSON.parse(body || '');
        console.log(refreshToken);

        if (refreshToken == null) {
            return unauthorizedResponse;
        }

        const identifyResult = identifyUserfromAuthorizationToken(`Bearer ${refreshToken}`);
        console.log(identifyResult);

        if (!identifyResult.identified) {
            return unauthorizedResponse;
        }

        const user = await getUser(identifyResult.userId);
        console.log(user);

        if (user == null) {
            return unauthorizedResponse;
        }

        return {
            statusCode: 200,
            body: JSON.stringify(generateUserTokenPair(user)),
        };
    } catch (e) {
        return unauthorizedResponse;
    }
};

export default index;
