import { Review } from '../entity/Review';
import { Revision } from '../entity/Revision';
import { getConnection } from '.';

interface Props {
    review: Review;
    revision?: Revision;
}

export async function insertReview({ review, revision }: Props) {
    const connection = await getConnection();

    const insertedReview = await connection.transaction(async (manager) => {
        const reviewRepository = manager.getRepository(Review);
        const revisionRepository = manager.getRepository(Revision);

        const insertedReview = await reviewRepository.save(review);

        if (revision == null) {
            return insertedReview;
        }

        const insertedRevision = await revisionRepository.save({ ...revision, review: insertedReview });

        await reviewRepository.update(insertedReview.id, {
            activeRevision: insertedRevision,
        });

        return { ...insertedReview, activeRevision: insertedRevision };
    });

    return insertedReview;
}
