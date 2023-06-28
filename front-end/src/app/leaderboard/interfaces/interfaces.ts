
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

export interface notif {
    friend: string,
    type: string,
    content: string,
}

export interface User {
    id: number;
    pseudo: string;
    login: string;
    pp: string;
    doubleAuth: boolean;
    authCode: string;
    status: string;
    friends: friend[];
    stats: stats;
    history: match[];
    pm: pm[];
    notif: notif[];
}
