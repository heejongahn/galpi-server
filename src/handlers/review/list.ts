import { Handler, APIGatewayEvent } from 'aws-lambda';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';

const index: Handler<APIGatewayEvent> = async event => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/list: Unauthorized`,
    };

    const getNoSuchUserResponse = (userId: string) => ({
        statusCode: 400,
        body: `review/list: No user with id ${userId} exists.`,
    });

    if (event.queryStringParameters == null || event.queryStringParameters['userId'] == null) {
        return unauthorizedResponse;
    }

    const { userId, skip = '0', take = '20' } = event.queryStringParameters;

    const connection = await getConnection();
    const user = await getUser(userId);

    const requestUserId = event.requestContext.authorizer != null ? event.requestContext.authorizer.userId : null;

    if (user == null) {
        return getNoSuchUserResponse(userId);
    }

    const condition = requestUserId === userId ? { user } : { user, isPublic: true };

    const reviews = await connection.getRepository(Review).find({
        where: condition,
        order: {
            createdAt: 'DESC',
        },
        skip: parseInt(skip, 10),
        take: parseInt(take, 10),
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ reviews }),
    };
};

export default index;
