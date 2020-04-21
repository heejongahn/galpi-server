import { Handler, APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { getUser } from '../../getUser';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

const { AWS_S3_BUCKET } = process.env;

const s3 = new S3();

const index: Handler<APIGatewayEvent> = async (event) => {
    const { queryStringParameters, body, requestContext, isBase64Encoded, headers } = event;
    const contentType = headers['content-type'];

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

    if (key == null || body == null) {
        return badRequestError;
    }

    const buffer = isBase64Encoded ? new Buffer(body, 'base64') : new Buffer(body, 'binary');

    const s3Params: PutObjectRequest = {
        Bucket: AWS_S3_BUCKET!,
        Key: `users/${user.id}/${key}`,
        Body: buffer,
        ContentLength: body.length,
        ContentType: contentType,
        ACL: 'public-read',
    };

    const result = await s3.upload(s3Params).promise();

    return {
        status: 200,
        body: result.Location,
    };
};

export default index;
