import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Review } from './Review';

enum ReadingStatus {
    hasntStarted = 'hasntStarted',
    reading = 'reading',
    finishedReading = 'finishedReading',
}

export interface RevisionPayload {
    stars: number;
    title: string;
    body: string;
    readingStatus: ReadingStatus;
}

@Entity()
export class Revision {
    /**
     * Generated
     */
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    lastModifiedAt!: Date;

    /**
     * Payload
     */
    @Column({ type: 'int' })
    stars!: number;

    @Column({ type: 'text' })
    title!: string;

    @Column({ type: 'text' })
    body!: string;

    @Column({ type: 'enum', enum: ReadingStatus })
    readingStatus!: string;

    /**
     * FK
     */
    @ManyToOne((type) => Review, (review) => review.revisions, { cascade: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fk_review_id' })
    review!: Review;
}

export function getDefaultRevision(): Revision {
    const r = new Revision();
    r.stars = 3;
    r.title = '';
    r.body = '';
    r.readingStatus = ReadingStatus.hasntStarted;

    return r;
}
