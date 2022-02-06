import { Handler, APIGatewayEvent } from 'aws-lambda';
import { getUser } from '../../getUser';
import { User } from '../../entity/User';
import { getConnection } from '../../database';

const index: Handler<APIGatewayEvent> = async (event) => {
    const { body, requestContext } = event;

    const unauthorizedResponse = {
        statusCode: 401,
        body: `Unauthorized`,
    };

    const notFoundResponse = {
        statusCode: 404,
        body: `No such user exists`,
    };

    const badRequestError = {
        statusCode: 400,
    };

    if (requestContext.authorizer == null || requestContext.authorizer.userId == null) {
        return unauthorizedResponse;
    }

    const user = await getUser(requestContext.authorizer.userId);

    if (user == null) {
        return notFoundResponse;
    }

    if (body == null) {
        return badRequestError;
    }

    try {
        const { displayName, introduction = '', profileImageUrl } = JSON.parse(body);

        user.displayName = displayName;
        user.profileImageUrl = profileImageUrl;
        user.introduction = introduction;

        const connection = await getConnection();
        const updated = await connection.getRepository(User).save(user);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ user: updated }),
        };
    } catch {
        return badRequestError;
    }
};

export default index;
