import axios from 'axios';
import { Handler, APIGatewayEvent } from 'aws-lambda';

const index: Handler<APIGatewayEvent> = async (event, context) => {
    const todo = await axios.get('https://jsonplaceholder.typicode.com/todos/1');

    const response = {
        statusCode: 200,
        body: JSON.stringify(todo.data),
    };

    return response;
};

export default index;
