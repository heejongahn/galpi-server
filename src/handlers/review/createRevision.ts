import { Handler, APIGatewayEvent } from 'aws-lambda';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import createMergedReviewAndRevision from '../../utils/createMergedReviewAndRevision';
import { RevisionPayload } from '../../entity/Revision';
import parseRevision from '../../utils/parseRevision';
import { insertRevision } from '../../database/insertRevision';

const endpointName = `review/addRevision`;

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `${endpointName}: Unauthorized`,
    };

    const badPayloadResponse = {
        statusCode: 400,
        body: `${endpointName}: Payload malformed`,
    };

    const getNoSuchReviewResponse = (reviewId: string) => ({
        statusCode: 400,
        body: `${endpointName}: No review with id ${reviewId} exists.`,
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
            revisionPayload?: RevisionPayload;
            reviewId?: string;
        } | null = JSON.parse(event.body || 'null');

        const { revisionPayload, reviewId } = parsed || {};

        if (revisionPayload == null || reviewId == null) {
            console.log(parsed);
            return badPayloadResponse;
        }

        const reviewRepository = connection.getRepository(Review);

        const review = await reviewRepository.findOne(reviewId);

        if (review == null) {
            return getNoSuchReviewResponse(reviewId);
        }

        const { revision } = parseRevision({ payload: revisionPayload });
        const updatedReview = await insertRevision({
            reviewId,
            revision,
            /**
             * FIXME: 임시 저장 서포트
             */ isActive: true,
        });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                review: createMergedReviewAndRevision({
                    review: updatedReview,
                }),
            }),
        };
    } catch (e) {
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
