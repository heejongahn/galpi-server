import { Handler, APIGatewayEvent } from 'aws-lambda';
import { getUser } from '../../getUser';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `me: Unauthorized`,
    };

    if (event.requestContext.authorizer == null || event.requestContext.authorizer.userId == null) {
        return unauthorizedResponse;
    }

    const user = await getUser(event.requestContext.authorizer.userId);

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
