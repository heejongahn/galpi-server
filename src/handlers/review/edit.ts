import { Handler, APIGatewayEvent } from 'aws-lambda';
import { LegacyReviewPayload, Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import parseReviewAndRevisionPayload from '../../utils/parseReviewAndRevisionPayload';
import { updateReview } from '../../database/updateReview';
import createActiveReviewResponse from '../../utils/createActiveReviewResponse';

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
            reviewPayload?: LegacyReviewPayload & { id: Review['id'] };
        } | null = JSON.parse(event.body || 'null');

        if (parsed == null || parsed.reviewPayload == null) {
            console.log('no');
            return badPayloadResponse;
        }
        const { id } = parsed.reviewPayload;

        console.log(parsed.reviewPayload);

        const reviewRepository = connection.getRepository(Review);

        const review = await reviewRepository.findOne(id);

        if (review == null) {
            return getNoSuchReviewResponse(id);
        }

        if (review.user.id !== user.id) {
            return unauthorizedResponse;
        }

        const { review: updatingReview, revision } = parseReviewAndRevisionPayload({
            payload: parsed.reviewPayload,
            user,
            book: review.book,
        });

        const updatedReview = await updateReview({
            review: { ...updatingReview, id: parsed.reviewPayload.id },
            revision,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ review: createActiveReviewResponse({ review: updatedReview }) }),
        };
    } catch (e) {
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
