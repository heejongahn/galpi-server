import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuthProviderUser } from './AuthProviderUser';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    email!: string;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    displayName?: string;

    @Column({ nullable: true })
    introduction?: string;

    @Column({ nullable: true })
    profileImageUrl?: string;

    @OneToMany((type) => AuthProviderUser, (AuthProviderUser) => AuthProviderUser.user)
    authProviderUsers!: AuthProviderUser[];
}
