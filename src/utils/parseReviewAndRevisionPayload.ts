import { LegacyReviewPayload, Review } from '../entity/Review';
import { User } from '../entity/User';
import { Book } from '../entity/Book';
import parseRevision from './parseRevision';

interface Props {
    payload: LegacyReviewPayload;
    user: User;
    book: Book;
}

export default function parseReviewAndRevisionPayload({ payload, user, book }: Props) {
    const { readingStartedAt, readingFinishedAt, isPublic } = payload;

    const review = new Review();

    review.readingStartedAt = readingStartedAt ? new Date(readingStartedAt) : undefined;
    review.readingFinishedAt = readingFinishedAt ? new Date(readingFinishedAt) : undefined;
    review.isPublic = isPublic;
    review.user = user;
    review.book = book;

    const { revision } = parseRevision({ payload });
    review.activeRevision = revision;

    return {
        review,
        revision,
    };
}
