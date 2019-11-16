import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { User } from "./User";

export enum ProviderType {
  google = "google",
  facebook = "facebook",
  twitter = "twitter"
}

@Entity("users")
export class AuthProviderUser {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: ProviderType
  })
  providerType!: ProviderType;

  @Column()
  providerId!: string;

  @ManyToOne(type => User, { cascade: true })
  @JoinColumn({ name: "fk_user_id" })
  user!: User;
}
