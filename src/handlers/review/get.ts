import { Handler, APIGatewayEvent } from 'aws-lambda';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/list: Unauthorized`,
    };

    const getNoSuchReviewResponse = (id: string) => ({
        statusCode: 400,
        body: `review/list: No review with id ${id} exists.`,
    });

    if (event.queryStringParameters == null || event.queryStringParameters['id'] == null) {
        return unauthorizedResponse;
    }

    const { id: reviewId } = event.queryStringParameters;

    const connection = await getConnection();

    const requestUserId = event.requestContext.authorizer != null ? event.requestContext.authorizer.userId : null;
    const requestUser = requestUserId != null ? await getUser(requestUserId) : null;

    const condition = requestUserId == null ? { isPublic: true } : [{ isPublic: true }, { user: requestUser }];

    const review = await connection.getRepository(Review).findOne({
        where: condition,
        order: {
            createdAt: 'DESC',
        },
    });

    if (review == null) {
        return getNoSuchReviewResponse(reviewId);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ review }),
    };
};

export default index;
