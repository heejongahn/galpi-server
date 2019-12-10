import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface BookPayload {
    isbn: string;
    title: string;
    authors: string[];
    publisher: string;
    linkUri: string;
    imageUri: string;
}

@Entity()
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    isbn!: string;

    @Column()
    title!: string;

    /**
     * NOTE: 출판사, 저자가 String으로 들어가는 게 맞을까?
     */
    @Column()
    author!: string;

    @Column()
    publisher!: string;

    @Column()
    linkUri!: string;

    @Column()
    imageUri!: string;
}
