export interface Notif {
    name?: string,
    pseudo?: string,
    login: string
    friend?: string,
    content: string,
    type: string,
}

export interface addFriend {
    login: string,
    friend: string
}