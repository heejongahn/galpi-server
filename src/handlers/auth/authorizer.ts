import { CustomAuthorizerHandler } from 'aws-lambda';

import { decodeUserToken } from '../../utils/auth/token';

const index: CustomAuthorizerHandler = async (event, context) => {
    if (event.authorizationToken == null) {
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: event.methodArn,
                    },
                ],
            },
        };
    }

    const [type, token] = event.authorizationToken.split(' ');
    const decoded = decodeUserToken(token);
    const allow = type === 'Bearer' && decoded.success;

    return {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: allow ? 'Allow' : 'Deny',
                    /**
                     * TODO: 캐싱 정책과 맞물려 들어갈 값 제대로 정하기
                     */
                    Resource: event.methodArn,
                },
            ],
        },
        context: decoded.success
            ? {
                  userId: decoded.payload.userId,
              }
            : {},
    };
};

export default index;
