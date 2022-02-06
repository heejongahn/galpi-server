import { Handler, APIGatewayEvent } from 'aws-lambda';
import { ReviewPayload, Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import createMergedReviewAndRevision from '../../utils/createMergedReviewAndRevision';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/edit: Unauthorized`,
    };

    const badPayloadResponse = {
        statusCode: 400,
        body: `review/edit: Payload malformed`,
    };

    const getNoSuchReviewResponse = (reviewId: string) => ({
        statusCode: 400,
        body: `review/edit: No review with id ${reviewId} exists.`,
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
        const parsed: {
            reviewPayload?: ReviewPayload & { id: Review['id'] };
        } | null = JSON.parse(event.body || 'null');

        if (parsed == null || parsed.reviewPayload == null) {
            console.log('no');
            return badPayloadResponse;
        }

        const { id, isPublic, readingStartedAt, readingFinishedAt } = parsed.reviewPayload;

        console.log(parsed.reviewPayload);

        const reviewRepository = connection.getRepository(Review);

        const review = await reviewRepository.findOne(id);

        if (review == null) {
            return getNoSuchReviewResponse(id);
        }

        if (review.user.id !== user.id) {
            return unauthorizedResponse;
        }

        Object.assign(review, { isPublic, readingStartedAt, readingFinishedAt });

        const updatedReview = await reviewRepository.save(review);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ review: createMergedReviewAndRevision({ review: updatedReview }) }),
        };
    } catch (e) {
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
