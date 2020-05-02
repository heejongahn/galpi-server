import { Handler, APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { getUser } from '../../getUser';

const { AWS_S3_BUCKET, AWS_SERVERLESS_REGION } = process.env;

const s3 = new S3();

const index: Handler<APIGatewayEvent> = async (event) => {
    try {
        const { queryStringParameters, requestContext } = event;

        const unauthorizedResponse = {
            statusCode: 401,
            body: `Unauthorized`,
        };

        const badRequestError = {
            statusCode: 400,
        };

        if (requestContext.authorizer == null || requestContext.authorizer.userId == null) {
            return unauthorizedResponse;
        }

        const user = await getUser(requestContext.authorizer.userId);

        if (user == null) {
            return unauthorizedResponse;
        }

        if (queryStringParameters == null) {
            return badRequestError;
        }

        const { key } = queryStringParameters;

        if (key == null) {
            return badRequestError;
        }

        const s3Key = `users/${user.id}/${key}`;
        const s3Params = {
            Bucket: AWS_S3_BUCKET!,
            Key: s3Key,
            ACL: 'public-read',
        };

        const signedUrl = await s3.getSignedUrlPromise('putObject', s3Params);
        const objectUrl = `https://s3.${AWS_SERVERLESS_REGION!}.amazonaws.com/${AWS_S3_BUCKET}/${s3Key}`;

        return {
            statusCode: 200,
            body: JSON.stringify({
                signedUrl,
                objectUrl,
            }),
        };
    } catch (e) {
        console.log(e);
        return {
            statusCode: 500,
        };
    }
};

export default index;
