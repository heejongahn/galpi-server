import { CustomAuthorizerHandler } from 'aws-lambda';

import { decodeUserToken } from '../../utils/auth/token';

const principalId = 'galpi-user';

const index: CustomAuthorizerHandler = async (event, context) => {
    console.log('a');
    if (event.authorizationToken == null) {
        return {
            principalId,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: event.methodArn,
                    },
                ],
            },
        };
    }

    const [type, token] = event.authorizationToken.split(' ');
    console.log('decoded end');
    const decoded = decodeUserToken(token);

    console.log('decoded end');
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
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
