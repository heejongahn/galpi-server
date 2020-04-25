import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
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

    @Column({ type: 'int' })
    stars!: number;

    @Column({ type: 'text' })
    title!: string;

    @Column({ type: 'text' })
    body!: string;

    @Column({ type: 'enum', enum: ReadingStatus })
    readingStatus!: string;

    @Column({ type: 'datetime', nullable: true })
    readingStartedAt?: Date;

    @Column({ type: 'datetime', nullable: true })
    readingFinishedAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    lastModifiedAt!: Date;

    @Column({ type: 'boolean', default: false })
    isPublic!: boolean;

    @ManyToOne(type => User, { cascade: true, eager: true })
    @JoinColumn({ name: 'fk_user_id' })
    user!: User;

    @ManyToOne(type => Book, { cascade: true, eager: true })
    @JoinColumn({ name: 'fk_book_id' })
    book!: Book;
}
