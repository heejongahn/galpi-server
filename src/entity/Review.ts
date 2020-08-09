import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';
import { User } from './User';
import { Revision } from './Revision';
import { Book } from './Book';

enum ReadingStatus {
    hasntStarted = 'hasntStarted',
    reading = 'reading',
    finishedReading = 'finishedReading',
}

export interface ReviewPayload {
    stars: number;
    title: string;
    body: string;
    readingStatus: ReadingStatus;
    readingStartedAt?: number;
    readingFinishedAt?: number;
    isPublic: boolean;
}

@Entity()
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    lastModifiedAt!: Date;

    @Column({ type: 'boolean', default: false })
    isPublic!: boolean;

    @Column({ type: 'datetime', nullable: true })
    readingStartedAt?: Date;

    @Column({ type: 'datetime', nullable: true })
    readingFinishedAt?: Date;

    @ManyToOne((type) => User, { cascade: true, eager: true })
    @JoinColumn({ name: 'fk_user_id' })
    user!: User;

    @ManyToOne((type) => Book, { cascade: true, eager: true })
    @JoinColumn({ name: 'fk_book_id' })
    book!: Book;

    @OneToOne((type) => Revision, { nullable: true, eager: true, cascade: false })
    @JoinColumn({ name: 'fk_active_revision_id' })
    activeRevision?: Revision;

    @OneToMany((type) => Revision, (revision) => revision.review, { cascade: true, eager: false })
    revisions!: Revision[];
}
