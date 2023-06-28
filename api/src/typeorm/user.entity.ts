import { IsArray, IsBoolean, IsEmpty, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface friend {
    name:string,
    pp: string,
    blocked: boolean,
}

export interface stats {
    matchs: number,
    win: number,
    lose: number,
}

export interface match {
    ownScore: number,
    opponentScore: number,
    opponent: string,
    winner: string,
}

export interface message {
    content: string,
    sender: string,
}

export interface pm {
    name: string,
    uuid: string,
    messages: message[],
}

export interface messageData {
    login: string,
    friend: string,
    content: string,
    sender: string,
}

export interface changePseudo {
    currentLogin: string,
    newPseudo: string,
}

export interface addFriend {
    login: string,
    friend: string,
}

export interface modify2fa {
    login: string,
    doubleAuth: boolean,
}

export interface newPp {
    login: string,
    newPp: string,
}

export interface changeBlockStatus {
    login: string,
    friend: string,
    block: boolean,
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @IsNotEmpty()
    @Column({
        nullable: true,
    })
    pseudo: string;

    @IsString()
    @IsNotEmpty()
    @Column({
        nullable: true,
    })
    login: string;

    @IsString()
    @Column({
        nullable: false,
        default: '',
    })
    pp: string;

    @IsBoolean()
    @Column({
        nullable: false,
        default: false,
    })
    doubleAuth: boolean;

    @IsString()
    @Column({
        nullable: true,
    })
    authCode: string;

    @IsString()
    @IsNotEmpty()
    @Column({
        nullable: false,
        default: 'ONLINE',
    })
    status: string;

    @IsArray()
    @Column('jsonb', {
        nullable: true,
    })
    friends: friend[];

    @IsEmpty()
    @Column('jsonb', {
        nullable: true,
    })
    stats: stats;

    @IsEmpty()
    @IsArray()
    @Column('jsonb', {
        nullable: true,
    })
    history: match[];

    @IsArray()
    @Column('jsonb', {
        nullable: true,
    })
    pm: pm[];
}
