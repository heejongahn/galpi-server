import { Handler, APIGatewayEvent } from 'aws-lambda';
import { BookPayload, Book } from '../../entity/Book';
import { getConnection } from '../../database';

const index: Handler<APIGatewayEvent> = async event => {
    const { body } = event;
    const badPayloadResponse = {
        statusCode: 400,
        message: `Book/create: payload malformed.`,
    };

    try {
        const connection = await getConnection();
        const bookRepository = connection.getRepository(Book);

        const parsed: {
            bookPayload?: BookPayload;
        } | null = JSON.parse(body || 'null');

        if (parsed == null || parsed.bookPayload == null) {
            return badPayloadResponse;
        }

        const { isbn, title, authors, publisher, linkUri, imageUri } = parsed.bookPayload;

        const existingBook = await bookRepository.findOne({ where: { isbn } });

        if (existingBook != null) {
            return {
                statusCode: 200,
                body: JSON.stringify({ bookId: existingBook.id }),
            };
        }

        const book = new Book();
        book.isbn = isbn;
        book.title = title;
        if (authors) {
            book.author = authors.join(', ');
        } else {
            book.author = author;
        }
        book.publisher = publisher;
        book.linkUri = linkUri;
        book.imageUri = imageUri;

        const insertedBook = await bookRepository.save(book);

        return {
            statusCode: 200,
            body: JSON.stringify({ bookId: insertedBook.id }),
        };
    } catch (e) {
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
