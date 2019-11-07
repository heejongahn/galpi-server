import { SecretsManager } from "aws-sdk";
import * as admin from "firebase-admin";
import * as process from "process";

const client = new SecretsManager({
  region: process.env.AWS_SERVERLESS_REGION!
});
const secretName = process.env.AWS_SECRET_MANAGER_NAME_FIREBASE!;

async function getFirebaseServiceAccount() {
  const data = await client
    .getSecretValue({
      SecretId: secretName
    })
    .promise();

  return JSON.parse(data.SecretString!);
}

interface VerifySuccess {
  type: "success";
  token: string;
}

interface VerifyFailed {
  type: "failed";
  reason: string;
}

type VerifyResult = VerifySuccess | VerifyFailed;

export default async function verifyFirebaseIdToken(
  idToken: string
): Promise<VerifyResult> {
  try {
    if (admin.apps.length === 0) {
      const data = await getFirebaseServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert(data)
      });
    }

    const { uid } = await admin.auth().verifyIdToken(idToken);
    return {
      type: "success",
      token: uid
    };
  } catch (e) {
    return {
      type: "failed",
      reason: e.message
    };
  }
}
