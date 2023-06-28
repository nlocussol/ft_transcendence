import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { message } from "./user.entity"
import { IsArray, IsEmpty, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';



export interface member {
    pseudo: string,
    status: string,
    mute: number,
}

export interface ChangeStatus {
    name: string,
    pwd: string,
    status: string,
}

export interface UserInRoom {
    name: string,
    pseudo: string,
}

export interface NewMessage {
    name: string,
    sender: string,
    content: string,
}

export interface UserStatus {
    name: string,
    pseudo: string,
    status: string,
}

export interface MuteUser{
    name: string,
    pseudo: string,
    time: number,
}

export interface BanUser{
    name: string,
    pseudo: string,
    askBanPseudo: string,
}

export interface Passwords{
    inputPassword: string,
    roomPassword: string,
}

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;


    @IsNotEmpty()
    @Column({
        nullable: true,
    })
    uuid: string;

    @IsEmpty()
    @IsString()
    @Column({
        nullable: true,
    })
    name: string;

    @IsEmpty()
    @IsString()
    @Column({
        nullable: true,
    })
    owner: string;

    // @IsStrongPassword()
    @IsEmpty()
    @IsString()
    @Column({
        nullable: true,
    })
    pwd: string;

    @IsNotEmpty()
    @IsString()
    @Column({
        nullable: false,
        default: 'PUBLIC'
    })
    status: string;

    @IsEmpty()
    @IsArray()
    @Column('jsonb', {
        nullable: true,
    })
    ban: string[];

    @IsEmpty()
    @IsArray()
    @Column('jsonb', {
        nullable: true,
    })
    members: member[];

    @IsEmpty()
    @IsArray()
    @Column('jsonb', {
        nullable: true,
    })
    messages: message[];
}
