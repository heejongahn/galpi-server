import { Handler, APIGatewayEvent } from 'aws-lambda';
import { BookPayload, Book } from '../../entity/Book';
import { getConnection } from '../../database';
import { normarlizeISBN } from '../../utils/isbn';

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
            console.log('createBook failed');
            console.log(parsed);
            return badPayloadResponse;
        }

        const { isbn, title, authors, author, publisher, linkUri, imageUri } = parsed.bookPayload;
        const normalizedISBN = normarlizeISBN(isbn.trim().split(' ')[0]);

        const existingBook = await bookRepository.findOne({ where: { isbn: normalizedISBN } });

        if (existingBook != null) {
            return {
                statusCode: 200,
                body: JSON.stringify({ bookId: existingBook.id }),
            };
        }

        const book = new Book();
        book.isbn = normalizedISBN;
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

        console.log('createBook success');
        console.log(parsed);
        return {
            statusCode: 200,
            body: JSON.stringify({ bookId: insertedBook.id }),
        };
    } catch (e) {
        console.log('createBook failed');
        console.log(e);
        return badPayloadResponse;
    }
};

export default index;
