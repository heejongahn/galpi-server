import { Handler, APIGatewayEvent } from 'aws-lambda';

const index: Handler<APIGatewayEvent> = async (event, context) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: Math.floor(Math.random() * 10),
        }),
    };

    return response;
};

export default index;
