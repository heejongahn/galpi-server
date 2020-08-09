import { Review } from '../entity/Review';

interface Props {
    review: Review;
}

export default function createActiveReviewResponse({ review }: Props) {
    const { activeRevision, lastModifiedAt, createdAt, ...reviewRest } = review;

    if (activeRevision == null) {
        throw new Error(`Review ${review.id} has no active revision.`);
    }

    const { review: _, ...revisionRest } = activeRevision;

    return {
        ...revisionRest,
        ...reviewRest,
    };
}
