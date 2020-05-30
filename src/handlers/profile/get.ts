import { Handler, APIGatewayEvent } from 'aws-lambda';
import { getUser } from '../../getUser';

const index: Handler<APIGatewayEvent> = async (event) => {
    const getNoSuchUserResponse = (id: string) => ({
        statusCode: 404,
        body: `No user with id ${id} exists.`,
    });

    if (event.queryStringParameters == null || event.queryStringParameters['userId'] == null) {
        return {
            statusCode: 400,
        };
    }

    const { userId } = event.queryStringParameters;
    const rawUser = await getUser(userId);

    if (rawUser == null) {
        return getNoSuchUserResponse(userId);
    }

    const { phoneNumber, authProviderUsers, ...user } = rawUser;

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ user }),
    };
};

export default index;
