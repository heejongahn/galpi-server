import { Handler, APIGatewayEvent } from 'aws-lambda';
import { IsNull, Not } from 'typeorm';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { identifyUserFromAuthorizationHeader } from '../../utils/auth/identify';
import createActiveReviewResponse from '../../utils/createActiveReviewResponse';

const index: Handler<APIGatewayEvent> = async (event) => {
    const unauthorizedResponse = {
        statusCode: 401,
        body: `review/list: Unauthorized`,
    };

    const getNoSuchUserResponse = (userId: string) => ({
        statusCode: 400,
        body: `review/list: No user with id ${userId} exists.`,
    });

    if (event.queryStringParameters == null || event.queryStringParameters['userId'] == null) {
        return unauthorizedResponse;
    }

    const { userId, skip = '0', take = '20', active = 'true' } = event.queryStringParameters;

    const connection = await getConnection();
    const user = await getUser(userId);

    const validateUserResult = identifyUserFromAuthorizationHeader(event.headers);
    console.log(validateUserResult);
    const requestUserId = validateUserResult.identified ? validateUserResult.userId : null;

    if (user == null) {
        return getNoSuchUserResponse(userId);
    }

    const commonCondition = {
        user,
        activeRevision: active === 'true' ? Not(IsNull()) : IsNull(),
    };

    const condition = requestUserId === userId ? commonCondition : { ...commonCondition, isPublic: true };

    const reviews = await connection.getRepository(Review).find({
        where: condition,
        order: {
            createdAt: 'DESC',
        },
        skip: parseInt(skip, 10),
        take: parseInt(take, 10),
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ reviews: reviews.map((r) => createActiveReviewResponse({ review: r })) }),
    };
};

export default index;
