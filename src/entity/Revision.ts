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
    readingStartedAt?: number;
    readingFinishedAt?: number;
    isPublic: boolean;
}

@Entity()
export class Revision {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'int' })
    stars!: number;

    @Column({ type: 'text' })
    title!: string;

    @Column({ type: 'text' })
    body!: string;

    @Column({ type: 'enum', enum: ReadingStatus })
    readingStatus!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    lastModifiedAt!: Date;

    @Column({ type: 'boolean', default: false })
    isPublic!: boolean;

    @ManyToOne((type) => Review, (review) => review.revisions, { cascade: false, eager: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fk_review_id' })
    review!: Review;
}
