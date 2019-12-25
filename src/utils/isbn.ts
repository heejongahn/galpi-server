import * as isbn from 'isbn-utils';

export function normarlizeISBN(isbn10Or13: string) {
    return isbn.asIsbn13(isbn10Or13);
}
