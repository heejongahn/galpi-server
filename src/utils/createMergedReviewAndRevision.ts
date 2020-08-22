import { Review } from '../entity/Review';
import { getDefaultRevision } from '../entity/Revision';

interface Props {
    review: Review;
}

export default function createMergedReviewAndRevision({ review }: Props) {
    const { activeRevision, lastModifiedAt, createdAt, ...reviewRest } = review;
    const { review: _, ...revisionRest } = activeRevision || getDefaultRevision();

    return {
        ...revisionRest,
        ...reviewRest,
    };
}
