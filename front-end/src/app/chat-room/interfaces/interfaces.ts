export interface MemberStatus {
    login: string,
    pseudo?: string,
    status: string,
    mute?: number
}

export interface Friend {
    pseudo: string,
    name:string,
    pp: string,
    blocked: boolean,
    status?: string,
    ppload?: boolean
}

export interface Passwords {
    roomPassword:string,
    inputPassword: string,
}

export interface NewRoom {
    name: string,
    owner: string,
    pwd: string,
    status: string
}
export interface JoinLeaveRoom {
    pseudo?: string,
    name: string,
    login: string
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

export interface Notif {
    name?: string,
    pseudo?: string,
    login: string
    friend: string,
    content: string,
    type: string,
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
    notif: Notif[]
}

export interface RoomMessage {
    name: string,
    sender: string,
    content: string
}