import { SecretsManager } from 'aws-sdk';
import * as admin from 'firebase-admin';
import * as process from 'process';

const client = new SecretsManager({
    region: process.env.AWS_SERVERLESS_REGION!,
});
const secretName = process.env.AWS_SECRET_MANAGER_NAME_FIREBASE!;

async function getFirebaseServiceAccount() {
    const data = await client
        .getSecretValue({
            SecretId: secretName,
        })
        .promise();

    return JSON.parse(data.SecretString!);
}

interface VerifySuccess {
    success: true;
    token: string;
    email: string;
}

interface VerifyFailed {
    success: false;
    reason: string;
}

type VerifyResult = VerifySuccess | VerifyFailed;

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifyResult> {
    try {
        if (admin.apps.length === 0) {
            console.log('no app');
            const data = await getFirebaseServiceAccount();
            admin.initializeApp({
                credential: admin.credential.cert(data),
            });
        }

        console.log('verifying');

        const result = await admin.auth().verifyIdToken(idToken);
        console.log({ result });

        return {
            success: true,
            token: result.uid,
            email: result.email,
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            reason: e.message,
        };
    }
}
