import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
    @Column({
        nullable: false,
        default: '',
    })
    id: string;

    @Column({
        nullable: false,
        default: '',
    })
    id: string;
        name        VARCHAR(50) NOT NULL,
        password    VARCHAR(50) NOT NULL,
        pp          VARCHAR(250) DEFAULT 'path/to/some/default/pic',
        doubleAuth  BOOLEAN DEFAULT false,
        status      VARCHAR DEFAULT 'ONLINE',
        friends     friend [],
        room	      VARCHAR(50)[],
        stats       stat,
        history     match[],
        mp   	      message[]
      );
}