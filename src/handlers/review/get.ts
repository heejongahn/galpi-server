import { Handler, APIGatewayEvent } from 'aws-lambda';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { identifyUserFromAuthorizationHeader } from '../../utils/auth/identify';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/list: Unauthorized`,
    };

    const getNoSuchReviewResponse = (id: string) => ({
        statusCode: 404,
        body: `review/list: No review with id ${id} exists.`,
    });

    if (event.queryStringParameters == null || event.queryStringParameters['id'] == null) {
        return unauthorizedResponse;
    }

    const { id: reviewId } = event.queryStringParameters;

    const connection = await getConnection();

    const validateUserResult = identifyUserFromAuthorizationHeader(event.headers);
    const requestUserId = validateUserResult.identified ? validateUserResult.userId : null;
    const requestUser = requestUserId != null ? await getUser(requestUserId) : null;

    const condition = requestUserId == null ? { isPublic: true } : [{ isPublic: true }, { user: requestUser }];

    const review = await connection.getRepository(Review).findOne(reviewId, {
        where: condition,
        order: {
            createdAt: 'DESC',
        },
    });

    console.log(review);

    if (review == null) {
        return getNoSuchReviewResponse(reviewId);
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ review }),
    };
};

export default index;
