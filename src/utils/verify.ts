import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
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
