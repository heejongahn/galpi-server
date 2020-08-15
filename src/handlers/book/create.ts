import { Handler, APIGatewayEvent } from 'aws-lambda';
import { BookPayload } from '../../entity/Book';
import { selectOrInsertBook } from '../../database/selectOrInsertBook';

const index: Handler<APIGatewayEvent> = async (event) => {
    const { body } = event;
    const badPayloadResponse = {
        statusCode: 400,
        message: `Book/create: payload malformed.`,
    };

    try {
        const parsed: {
            bookPayload?: BookPayload;
        } | null = JSON.parse(body || 'null');

        if (parsed == null || parsed.bookPayload == null) {
            console.log('createBook failed');
            console.log(parsed);
            return badPayloadResponse;
        }

        const book = await selectOrInsertBook(parsed.bookPayload);

        console.log('createBook success');
        console.log(parsed);
        return {
            statusCode: 200,
            body: JSON.stringify({ bookId: book.id }),
        };
    } catch (e) {
        console.log('createBook failed');
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
