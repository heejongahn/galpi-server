import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AuthProviderUser } from "./AuthProviderUser";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  email!: string;

  @Column()
  phoneNumber!: string;

  @Column()
  displayName!: string;

  @OneToMany(
    type => AuthProviderUser,
    AuthProviderUser => AuthProviderUser.user
  )
  authProviderUsers!: AuthProviderUser[];
}
