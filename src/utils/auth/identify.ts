import { decodeUserToken } from './token';

export const identifyUserfromAuthorizationToken = (authorizationToken?: string) => {
    if (authorizationToken == null) {
        return { identified: false } as const;
    }

    const [type, token] = authorizationToken.split(' ');
    const decoded = type === 'Bearer' ? decodeUserToken(token) : ({ success: false } as const);

    if (!decoded.success) {
        return { identified: false } as const;
    }

    return {
        identified: true,
        userId: decoded.payload.userId,
    } as const;
};

export const identifyUserFromAuthorizationHeader = (headers: { [name: string]: string }) => {
    const authorizationKey = Object.keys(headers).find((key) => key.toLowerCase() === 'authorization');

    if (authorizationKey == null) {
        return {
            identified: false,
        } as const;
    }

    return identifyUserfromAuthorizationToken(headers[authorizationKey]);
};
