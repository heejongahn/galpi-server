import { Review } from '../entity/Review';
import { getDefaultRevision } from '../entity/Revision';

interface Props {
    review: Review;
}

export default function createMergedReviewAndRevision({ review }: Props) {
    const { activeRevision, ...reviewRest } = review;
    const { review: _, id: __, ...activeRevisionWithoutReview } = activeRevision || {};

    /**
     * Simulate review before the concept of revision introduced for old clients
     */
    const backworkdCompatibleReview = {
        ...reviewRest,
        ...getDefaultRevision(),
        ...activeRevisionWithoutReview,
    };

    return {
        ...backworkdCompatibleReview,
        activeRevision: activeRevision != null ? activeRevisionWithoutReview : undefined,
    };
}
