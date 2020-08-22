import { Review } from '../entity/Review';
import { Revision } from '../entity/Revision';
import { getConnection } from '.';

interface Props {
    reviewId: Review['id'];
    revision?: Revision;
    isActive: boolean;
}

export async function insertRevision({ reviewId, revision, isActive }: Props) {
    const connection = await getConnection();

    const updatedReview = await connection.transaction(async (manager) => {
        const reviewRepository = manager.getRepository(Review);
        const revisionRepository = manager.getRepository(Revision);

        const review = await reviewRepository.findOne(reviewId);

        if (review == null) {
            throw new Error(`There is no review with id ${reviewId}`);
        }

        const insertedRevision = await revisionRepository.save({ ...revision, review });

        if (isActive) {
            await reviewRepository.update(review.id, {
                activeRevision: insertedRevision,
            });
        }

        return { ...review, activeRevision: isActive ? insertedRevision : review.activeRevision };
    });

    return updatedReview;
}
