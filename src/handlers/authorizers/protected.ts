import { CustomAuthorizerHandler } from 'aws-lambda';

import { identifyUserfromAuthorizationToken } from '../../utils/auth/identify';

const principalId = 'galpi-user';

const index: CustomAuthorizerHandler = async (event) => {
    const validateUserFromAuthorizationTokenResult = identifyUserfromAuthorizationToken(event.authorizationToken);

    if (!validateUserFromAuthorizationTokenResult.identified) {
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

    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    // FIXME: More fine-grained resource control
                    Resource: '*',
                },
            ],
        },
        context: {
            userId: validateUserFromAuthorizationTokenResult.userId,
        },
    };
};

export default index;
