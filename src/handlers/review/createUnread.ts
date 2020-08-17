import { Handler, APIGatewayEvent } from 'aws-lambda';
import { BookPayload } from '../../entity/Book';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { insertReview } from '../../database/insertReview';
import { selectOrInsertBook } from '../../database/selectOrInsertBook';

const index: Handler<APIGatewayEvent> = async (event) => {
    const { body } = event;
    const badPayloadResponse = {
        statusCode: 400,
        message: `review/createUnread: Payload Malformed`,
    };

    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/createUnread: Unauthorized`,
    };

    try {
        if (event.requestContext.authorizer == null || event.requestContext.authorizer.userId == null) {
            return unauthorizedResponse;
        }

        const user = await getUser(event.requestContext.authorizer.userId);

        if (user == null) {
            return unauthorizedResponse;
        }
        const parsed: {
            bookPayload?: BookPayload;
        } | null = JSON.parse(body || 'null');

        if (parsed == null || parsed.bookPayload == null) {
            console.log('createBook failed');
            console.log(parsed);
            return badPayloadResponse;
        }

        const book = await selectOrInsertBook(parsed.bookPayload);

        const review = new Review();
        review.isPublic = false;
        review.user = user;
        review.book = book;

        const insertedReview = await insertReview({ review });

        return {
            statusCode: 200,
            body: JSON.stringify({
                review: insertedReview,
            }),
        };
    } catch (e) {
        console.log('saveBook failed');
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
