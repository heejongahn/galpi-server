import { Revision, RevisionPayload } from '../entity/Revision';

interface Props {
    payload: RevisionPayload;
}

export default function parseRevision({ payload }: Props) {
    const { stars, title, body, readingStatus } = payload;

    const revision = new Revision();
    revision.stars = stars;
    revision.title = title;
    revision.body = body;
    revision.readingStatus = readingStatus;

    return {
        revision,
    };
}
