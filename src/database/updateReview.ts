import { Review } from '../entity/Review';
import { Revision } from '../entity/Revision';
import { getConnection } from '.';

interface Props {
    review: Review;
    revision: Revision;
}

export async function updateReview({ review, revision }: Props) {
    const connection = await getConnection();

    const updatedReview = await connection.transaction(async (manager) => {
        const reviewRepository = manager.getRepository(Review);
        const revisionRepository = manager.getRepository(Revision);

        revision.review = review;
        const insertedRevision = await revisionRepository.save(revision);

        const { isPublic, readingStartedAt, readingFinishedAt } = review;

        console.log(review);
        await reviewRepository.update(review.id, {
            isPublic,
            readingStartedAt,
            readingFinishedAt,
            activeRevision: insertedRevision,
        });

        return { ...review, activeRevision: insertedRevision };
    });

    return updatedReview;
}
