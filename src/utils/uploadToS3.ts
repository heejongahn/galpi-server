import axios from 'axios';
import { S3 } from 'aws-sdk';

export async function uploadToS3({ sourceUrl, key }: { sourceUrl: string; key: string }) {
    const { AWS_S3_BUCKET: Bucket } = process.env;

    if (Bucket == null) {
        throw new Error(`uploadToS3: process.env.AWS_S3_BUCKET is undefined.`);
    }

    const s3 = new S3();

    const { data: buffer, headers } = await axios.get<Buffer>(sourceUrl, { responseType: 'arraybuffer' });
    const contentType = headers['content-type'];

    const extension = contentType.split('/')[1];

    const s3Params = {
        Bucket,
        Key: `${key}.${extension}`,
        ContentType: contentType,
        ACL: 'public-read',
    };

    const result = await s3
        .upload({
            ...s3Params,
            Body: buffer,
        })
        .promise();

    // FIXME: CloudFront
    return result.Location;
}
