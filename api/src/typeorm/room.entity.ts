import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { message } from "./user.entity"
import { IsArray, IsEmpty, IsNotEmpty, IsString } from 'class-validator';



export interface member {
    login: string,
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
    login: string,
    pseudo: string,
}

export interface NewMessage {
    name: string,
    sender: string,
    content: string,
}

export interface UserStatus {
    name: string,
    login: string,
    status: string,
}

export interface MuteUser{
    name: string,
    login: string,
    time: number,
}

export interface BanUser{
    name: string,
    login: string,
    askBanLogin: string,
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
