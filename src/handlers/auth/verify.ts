import { Handler, APIGatewayEvent } from 'aws-lambda';
import { decodeUserToken } from '../../utils/auth/token';

const index: Handler<APIGatewayEvent> = async (event, context) => {
    const { Authorization } = event.headers;

    if (Authorization == null) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'verify: `Authorization` header is required.',
            }),
        };
    }

    const token = Authorization.split(' ')[1];

    if (token == null) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'verify: `Authorization` header is malformed.',
            }),
        };
    }

    const decoded = decodeUserToken(token);

    if (decoded.success) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: decoded.payload.userId }),
        };
    } else {
        return {
            statusCode: 403,
            body: JSON.stringify({
                message: `verify: Invalid token. ${decoded.reason}`,
            }),
        };
    }
};

export default index;
