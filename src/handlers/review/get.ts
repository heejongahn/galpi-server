import { Handler, APIGatewayEvent } from 'aws-lambda';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { identifyUserFromAuthorizationHeader } from '../../utils/auth/identify';
import createMergedReviewAndRevision from '../../utils/createMergedReviewAndRevision';

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

    const review = await connection.getRepository(Review).findOne(reviewId);

    if (review == null) {
        return getNoSuchReviewResponse(reviewId);
    }

    const canSeeReview = review.isPublic || review.user.id === requestUserId;

    if (!canSeeReview) {
        return getNoSuchReviewResponse(reviewId);
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ review: createMergedReviewAndRevision({ review }) }),
    };
};

export default index;
