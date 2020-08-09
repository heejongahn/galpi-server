import { Handler, APIGatewayEvent } from 'aws-lambda';
import { ReviewPayload, Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { Book } from '../../entity/Book';
import createActiveReviewResponse from '../../utils/createActiveReviewResponse';
import parseReviewAndRevisionPayload from '../../utils/parseReviewAndRevisionPayload';
import { insertReview } from '../../database/insertReview';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/create: Unauthorized`,
    };

    const badPayloadResponse = {
        statusCode: 400,
        body: `review/create: Payload malformed`,
    };

    const getNoSuchBookResponse = (bookId: string) => ({
        statusCode: 400,
        body: `review/create: No book with id ${bookId} exists.`,
    });

    if (event.requestContext.authorizer == null || event.requestContext.authorizer.userId == null) {
        return unauthorizedResponse;
    }

    const connection = await getConnection();
    const user = await getUser(event.requestContext.authorizer.userId);

    if (user == null) {
        console.log('createReview failed');
        return unauthorizedResponse;
    }

    try {
        const parsed: {
            reviewPayload?: ReviewPayload;
            bookId?: string;
        } | null = JSON.parse(event.body || 'null');

        if (parsed == null || parsed.reviewPayload == null || parsed.bookId == null) {
            console.log('createReview failed');
            console.log(parsed);
            return badPayloadResponse;
        }

        const { reviewPayload, bookId } = parsed;

        console.log(reviewPayload);

        const book = await connection.getRepository(Book).findOne(bookId);

        if (book == null) {
            return getNoSuchBookResponse(bookId);
        }

        const { review, revision } = parseReviewAndRevisionPayload({ payload: reviewPayload, user, book });
        const insertedReview = await insertReview({ review, revision });

        return {
            statusCode: 200,
            body: JSON.stringify({
                review: createActiveReviewResponse({
                    review: insertedReview,
                }),
            }),
        };
    } catch (e) {
        console.log('createReview failed');
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
