import { ReviewPayload, Review } from '../entity/Review';
import { Revision } from '../entity/Revision';
import { User } from '../entity/User';
import { Book } from '../entity/Book';

interface Props {
    payload: ReviewPayload;
    user: User;
    book: Book;
}

export default function parseReviewAndRevisionPayload({ payload, user, book }: Props) {
    const { stars, title, body, readingStatus, readingStartedAt, readingFinishedAt, isPublic } = payload;

    const review = new Review();

    review.readingStartedAt = readingStartedAt ? new Date(readingStartedAt) : undefined;
    review.readingFinishedAt = readingFinishedAt ? new Date(readingFinishedAt) : undefined;
    review.isPublic = isPublic;
    review.user = user;
    review.book = book;

    const revision = new Revision();
    revision.stars = stars;
    revision.title = title;
    revision.body = body;
    revision.readingStatus = readingStatus;
    review.activeRevision = revision;

    return {
        review,
        revision,
    };
}
