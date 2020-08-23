import { LegacyReviewPayload } from '../entity/Review';
import { User } from '../entity/User';
import { Book } from '../entity/Book';
import parseRevision from './parseRevision';
import parseReview from './parseReview';

interface Props {
    payload: LegacyReviewPayload;
    user: User;
    book: Book;
}

export default function parseReviewAndRevisionPayload({ payload, user, book }: Props) {
    const { revision } = parseRevision({ payload });

    const { review } = parseReview({
        payload,
        user,
        book,
        activeRevision: revision,
    });

    return {
        review,
        revision,
    };
}
