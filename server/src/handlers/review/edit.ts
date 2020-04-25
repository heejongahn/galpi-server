import { Handler, APIGatewayEvent } from 'aws-lambda';
import { ReviewPayload, Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';

const index: Handler<APIGatewayEvent> = async event => {
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
            return badPayloadResponse;
        }

        const {
            id,
            stars,
            title,
            body,
            readingStatus,
            readingStartedAt,
            readingFinishedAt,
            isPublic,
        } = parsed.reviewPayload;

        console.log(parsed.reviewPayload);

        const reviewRepository = connection.getRepository(Review);

        const review = await reviewRepository.findOne(id);

        if (review == null) {
            return getNoSuchReviewResponse(id);
        }

        if (review.user.id !== user.id) {
            return unauthorizedResponse;
        }

        review.stars = stars;
        review.title = title;
        review.body = body;
        review.readingStatus = readingStatus;
        review.readingStartedAt = readingStartedAt ? new Date(readingStartedAt) : undefined;
        review.readingFinishedAt = readingFinishedAt ? new Date(readingFinishedAt) : undefined;
        review.isPublic = isPublic;

        const updatedReview = await reviewRepository.save(review);

        return {
            statusCode: 200,
            body: JSON.stringify({ review: updatedReview }),
        };
    } catch (e) {
        return badPayloadResponse;
    }
};

export default index;
