import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

export enum AuthProviderType {
    google = 'google',
    facebook = 'facebook',
    twitter = 'twitter',
    firebase = 'firebase',
}

@Entity()
@Unique(['providerType', 'providerId'])
export class AuthProviderUser {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'enum',
        enum: AuthProviderType,
    })
    providerType!: AuthProviderType;

    @Column()
    providerId!: string;

    @ManyToOne(type => User, { cascade: true, eager: true })
    @JoinColumn({ name: 'fk_user_id' })
    user!: User;
}
