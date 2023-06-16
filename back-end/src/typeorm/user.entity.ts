import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface friend {
    name:string,
    bloqued: boolean,
}

export interface stats {
    matchs: number,
    win: number,
    loose: number,
}

export interface match {
    OwnScore: number,
    OpponentScore: number,
    opponent: string,
    winner: boolean,
}

export interface message {
    name: string,
    message: string[],
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
    })
    login: string;
    
    @Column({
        nullable: true,
    })
    pseudo: string;

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
    mp: message[];
}
