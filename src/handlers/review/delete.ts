import { Handler, APIGatewayEvent } from 'aws-lambda';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { removeReview } from '../../database/removeReview';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/delete: Unauthorized`,
    };

    const badPayloadResponse = {
        statusCode: 400,
        body: `review/delete: Payload malformed`,
    };

    const getNoSuchReviewResponse = (reviewId: string) => ({
        statusCode: 400,
        body: `review/delete: No review with id ${reviewId} exists.`,
    });

    if (event.requestContext.authorizer == null || event.requestContext.authorizer.userId == null) {
        return unauthorizedResponse;
    }

    const connection = await getConnection();
    const user = await getUser(event.requestContext.authorizer.userId);

    if (user == null) {
        return unauthorizedResponse;
    }

    try {
        if (event.queryStringParameters == null || event.queryStringParameters.reviewId == null) {
            return badPayloadResponse;
        }

        const reviewId = event.queryStringParameters.reviewId;

        const reviewRepository = connection.getRepository(Review);

        const review = await reviewRepository.findOne(reviewId, { relations: ['revisions'] });

        if (review == null) {
            return getNoSuchReviewResponse(reviewId);
        }

        if (review.user.id !== user.id) {
            return unauthorizedResponse;
        }

        await removeReview({ review });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ success: true }),
        };
    } catch (e) {
        return badPayloadResponse;
    }
};

export default index;
