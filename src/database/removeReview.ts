import { Review } from '../entity/Review';
import { getConnection } from '.';
import { Revision } from '../entity/Revision';

interface Props {
    review: Review;
}

export async function removeReview({ review }: Props) {
    const connection = await getConnection();

    await connection.transaction(async (manager) => {
        const reviewRepository = manager.getRepository(Review);
        const revisionRepository = manager.getRepository(Revision);

        await reviewRepository.update(review.id, {
            activeRevision: undefined,
        });

        const { revisions } = (await reviewRepository.findOne({ id: review.id }, { relations: ['revisions'] })) || {};

        if (revisions) {
            await revisionRepository.remove(revisions);
        }

        await reviewRepository.remove([review]);
    });
}
