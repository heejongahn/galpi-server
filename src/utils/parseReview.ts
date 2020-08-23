import { ReviewPayload, Review } from '../entity/Review';
import { User } from '../entity/User';
import { Book } from '../entity/Book';
import { Revision } from '../entity/Revision';

interface Props {
    payload: ReviewPayload;
    user: User;
    book: Book;
    activeRevision?: Revision;
}

export default function parseReview({ payload, user, book, activeRevision }: Props) {
    const { readingStartedAt, readingFinishedAt, isPublic } = payload;

    const review = new Review();

    review.readingStartedAt = readingStartedAt ? new Date(readingStartedAt) : undefined;
    review.readingFinishedAt = readingFinishedAt ? new Date(readingFinishedAt) : undefined;
    review.isPublic = isPublic;
    review.user = user;
    review.book = book;
    review.activeRevision = activeRevision;

    return {
        review,
    };
}
