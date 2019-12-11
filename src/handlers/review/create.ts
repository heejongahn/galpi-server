import { Handler, APIGatewayEvent } from 'aws-lambda';
import { ReviewPayload, Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { Book } from '../../entity/Book';

const index: Handler<APIGatewayEvent> = async event => {
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
        return unauthorizedResponse;
    }

    try {
        const parsed: {
            reviewPayload?: ReviewPayload;
            bookId?: string;
        } | null = JSON.parse(event.body || 'null');

        if (parsed == null || parsed.reviewPayload == null || parsed.bookId == null) {
            return badPayloadResponse;
        }

        const { reviewPayload, bookId } = parsed;

        const book = await connection.getRepository(Book).findOne(bookId);

        if (book == null) {
            return getNoSuchBookResponse(bookId);
        }

        const { stars, title, body, readingStatus, readingStartedAt, readingFinishedAt, isPublic } = reviewPayload;

        const review = new Review();
        review.stars = stars;
        review.title = title;
        review.body = body;
        review.readingStatus = readingStatus;
        review.readingStartedAt = readingStartedAt ? new Date(readingStartedAt) : undefined;
        review.readingFinishedAt = readingFinishedAt ? new Date(readingFinishedAt) : undefined;
        review.isPublic = isPublic;
        review.user = user;
        review.book = book;

        const insertedReview = await connection.getRepository(Review).save(review);

        return {
            statusCode: 200,
            body: JSON.stringify({ review: insertedReview }),
        };
    } catch (e) {
        return badPayloadResponse;
    }
};

export default index;
