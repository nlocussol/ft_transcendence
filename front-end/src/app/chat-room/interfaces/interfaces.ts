export interface MemberStatus {
    pseudo: string,
    status: string,
    mute?: number
}

export interface Friend {
    name:string,
    pp: string,
    blocked: boolean,
}

export interface NewRoom {
    name: string,
    owner: string,
    pwd: string,
    status: string
}
export interface JoinLeaveRoom {
    name: string,
    pseudo: string
}

export interface Message {
    sender: string,
    content: string,
}

export interface Room {
    id: number,
    uuid: string,
    name: string,
    owner: string,
    pwd: string,
    status: string,
    ban: string[],
    members: MemberStatus[],
    messages: Message[]
}

export interface Stat {
    lose: number,
    win: number,
    matchs: number
}

export interface Friend {
    name: string,
    pp: string,
    blocked: boolean
}

export interface History {
    ownScore: number,
    opponentScore: number,
    opponent: string,
    winner: string
}

export interface UserData {
    authCode: string,
    status: string,
    pseudo :string,
    email: string,
    pp: string,
    login: string,
    doubleAuth: boolean,
    friends: Friend[],
    pm: Message[]
    history: History[],
    stats: Stat[],
}

export interface RoomMessage {
    name: string,
    sender: string,
    content: string
}