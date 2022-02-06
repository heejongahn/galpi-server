import { Handler, APIGatewayEvent } from 'aws-lambda';
import { ReviewPayload } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { Book } from '../../entity/Book';
import createMergedReviewAndRevision from '../../utils/createMergedReviewAndRevision';
import { insertReview } from '../../database/insertReview';
import { RevisionPayload } from '../../entity/Revision';
import parseRevision from '../../utils/parseRevision';
import parseReview from '../../utils/parseReview';

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
            revisionPayload?: RevisionPayload;
            bookId?: string;
        } | null = JSON.parse(event.body || 'null');

        if (parsed == null || parsed.reviewPayload == null || parsed.revisionPayload == null || parsed.bookId == null) {
            console.log('createReview failed');
            console.log(parsed);
            return badPayloadResponse;
        }

        const { reviewPayload, revisionPayload, bookId } = parsed;

        console.log(reviewPayload);

        const book = await connection.getRepository(Book).findOne(bookId);

        if (book == null) {
            return getNoSuchBookResponse(bookId);
        }

        const { revision } = parseRevision({ payload: revisionPayload });
        const { review } = parseReview({
            payload: reviewPayload,
            user,
            book,
            activeRevision: revision,
        });

        const insertedReview = await insertReview({ review, revision });

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                review: createMergedReviewAndRevision({
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
