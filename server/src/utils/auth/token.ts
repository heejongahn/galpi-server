import { sign, verify, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { User } from '../../entity/User';

const { JWT_SECRET_KEY, JWT_ALGORITHM = 'HS256' } = process.env;

interface TokenPayload {
    userId: User['id'];
}

export function generateUserToken(user: User): string | null {
    if (JWT_SECRET_KEY == null) {
        return null;
    }

    const payload: TokenPayload = {
        userId: user.id,
    };

    const option: SignOptions = {
        expiresIn: '7d',
        algorithm: JWT_ALGORITHM,
    };

    return sign(payload, JWT_SECRET_KEY, option);
}

type DecodeResult = { success: true; payload: TokenPayload } | { success: false; reason: string };

export function decodeUserToken(token: string): DecodeResult {
    if (JWT_SECRET_KEY == null) {
        return { success: false, reason: '`JWT_SECRET_KEY` is not provided.' };
    }

    const option: VerifyOptions = {
        algorithms: [JWT_ALGORITHM],
    };

    try {
        const decodedPayload = verify(token, JWT_SECRET_KEY, option) as string | TokenPayload;

        if (typeof decodedPayload === 'string' || decodedPayload.userId == null) {
            return { success: false, reason: '`userId` field is missing from token payload.' };
        } else {
            return { success: true, payload: decodedPayload };
        }
    } catch (e) {
        return { success: false, reason: `Error while verifying: ${e.message}` };
    }
}
