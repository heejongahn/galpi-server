import { Review } from '../entity/Review';
import { Revision } from '../entity/Revision';
import { getConnection } from '.';

interface Props {
    review: Review;
}

export async function removeReview({ review }: Props) {
    const connection = await getConnection();

    await connection.transaction(async (manager) => {
        const reviewRepository = manager.getRepository(Review);

        await reviewRepository.update(review.id, {
            activeRevision: undefined,
        });

        await reviewRepository.remove([review]);
    });
}
