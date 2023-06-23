import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface friend {
    name:string,
    pp: string,
    blocked: boolean,
}

export interface stats {
    matchs: number,
    win: number,
    loose: number,
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
    pseudo: string,
    friend: string,
    content: string,
    sender: string,
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
    })
    pseudo: string;

    @Column({
        nullable: true,
    })
    login: string;

    @Column({
        nullable: true,
    })
    email: string;

    @Column({
        nullable: false,
        default: '',
    })
    pp: string;

    @Column({
        nullable: false,
        default: false,
    })
    doubleAuth: boolean;

    @Column({
        nullable: true,
    })
    authCode: string;

    @Column({
        nullable: false,
        default: 'ONLINE',
    })
    status: string;

    @Column('jsonb', {
        nullable: true,
    })
    friends: friend[];

    @Column('jsonb', {
        nullable: true,
    })
    room: string[];

    @Column('jsonb', {
        nullable: true,
    })
    stats: stats;

    @Column('jsonb', {
        nullable: true,
    })
    history: match[];

    @Column('jsonb', {
        nullable: true,
    })
    pm: pm[];
}
