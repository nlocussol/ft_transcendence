import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { message } from "./user.entity"

export interface member {
    pseudo: string,
    status: string,
}

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
    })
    uuid: string;

    @Column({
        nullable: true,
    })
    name: string;
    
    @Column({
        nullable: true,
    })
    owner: string;

    @Column({
        nullable: true,
    })
    pwd: string;

    @Column({
        nullable: false,
        default: 'PUBLIC'
    })
    status: string;

    @Column('jsonb', {
        nullable: true,
    })
    members: member[];

    @Column('jsonb', {
        nullable: true,
    })
    messages: message[];
}