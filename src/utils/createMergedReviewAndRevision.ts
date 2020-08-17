import { Review } from '../entity/Review';

interface Props {
    review: Review;
}

export default function createMergedReviewAndRevision({ review }: Props) {
    const { activeRevision, lastModifiedAt, createdAt, ...reviewRest } = review;
    const { review: _, ...revisionRest } = activeRevision || {};

    return {
        ...revisionRest,
        ...reviewRest,
    };
}
