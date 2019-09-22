import { Handler, APIGatewayEvent } from "aws-lambda";
import verifyFirebaseIdToken from "./utils/verify";

export const hello: Handler = async (event, context) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: Math.floor(Math.random() * 10)
    })
  };

  return response;
};

export const verify: Handler<APIGatewayEvent> = async (event, context) => {
  const { token } = event.headers || {};
  const verifyResult = await verifyFirebaseIdToken(token);

  if (verifyResult.type === "success") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: verifyResult.token
      })
    };
  } else {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: verifyResult.reason
      })
    };
  }
};
