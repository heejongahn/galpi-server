import { Handler, APIGatewayEvent } from "aws-lambda";
import verifyFirebaseIdToken from "../utils/verify";

const index: Handler<APIGatewayEvent> = async (event, context) => {
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

export default index;
