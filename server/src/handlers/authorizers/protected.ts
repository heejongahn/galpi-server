import { CustomAuthorizerHandler } from 'aws-lambda';

import { decodeUserToken } from '../../utils/auth/token';

const principalId = 'galpi-user';

const index: CustomAuthorizerHandler = async (event, context) => {
    if (event.authorizationToken == null) {
        return {
            principalId,
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
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: allow ? 'Allow' : 'Deny',
                    // FIXME: More fine-grained resource control
                    Resource: '*',
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
