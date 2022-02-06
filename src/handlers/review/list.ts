import { Handler, APIGatewayEvent } from 'aws-lambda';
import { IsNull, Not } from 'typeorm';
import { Review } from '../../entity/Review';
import { getUser } from '../../getUser';
import { getConnection } from '../../database';
import { identifyUserFromAuthorizationHeader } from '../../utils/auth/identify';
import createMergedReviewAndRevision from '../../utils/createMergedReviewAndRevision';

enum ListType {
    All = 'all',
    Unread = 'unread',
    Read = 'read',
}

function getActiveRevisionCondition(listType: string) {
    switch (listType) {
        case ListType.All: {
            return {};
        }
        case ListType.Unread: {
            return { activeRevision: IsNull() };
        }
        case ListType.Read: {
            return { activeRevision: Not(IsNull()) };
        }
        default: {
            return {};
        }
    }
}

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

    const { userId, skip = '0', take = '20', listType = ListType.All } = event.queryStringParameters;

    console.log(event.queryStringParameters);

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
        ...getActiveRevisionCondition(listType),
    };

    const condition = requestUserId === userId ? commonCondition : { ...commonCondition, isPublic: true };

    console.log(condition);

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
        body: JSON.stringify({ reviews: reviews.map((r) => createMergedReviewAndRevision({ review: r })) }),
    };
};

export default index;
