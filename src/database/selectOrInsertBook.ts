import { BookPayload, Book } from '../entity/Book';
import { normarlizeISBN } from '../utils/isbn';
import { getConnection } from '.';
import { uploadToS3 } from '../utils/uploadToS3';

export async function selectOrInsertBook(payload: BookPayload) {
    const connection = await getConnection();
    const bookRepository = connection.getRepository(Book);

    const { isbn, title, authors, author, publisher, linkUri, imageUri } = payload;
    const normalizedISBN = normarlizeISBN(isbn.trim().split(' ')[0]);

    const existingBook = await bookRepository.findOne({ where: { isbn: normalizedISBN } });

    if (existingBook != null) {
        return existingBook;
    }

    const book = new Book();
    book.isbn = normalizedISBN;
    book.title = title;
    if (authors) {
        book.author = authors.join(', ');
    } else {
        book.author = author;
    }
    book.publisher = publisher || '출판사 정보 없음';
    book.linkUri = linkUri;

    book.imageUri =
        imageUri != null && imageUri.length > 0
            ? await uploadToS3({
                  sourceUrl: imageUri,
                  key: `images/books/${normalizedISBN}`,
              })
            : '';

    const insertedBook = await bookRepository.save(book);
    return insertedBook;
}
