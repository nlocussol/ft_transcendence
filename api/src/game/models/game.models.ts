export enum side {
    LEFT = 0,
    RIGHT = 1
}

export class Ball {
    posX: number;
    posY: number;
    velX: number;
    velY: number;
    radius: number;
    canMove: boolean = false;
}

export class Player {
    side?: number;
    pseudo?: string;
    posX?: number;
    posY?: number;
    velY?: number;
    height?: number;
    width?: number;
    score?: number;
    endScreenWin: boolean;
    canMove: boolean = false;
    AFK: boolean = false;
    AFKTimer: number = 0;
    AFKInterval: any;
}

export class GameData {
    over: boolean = false;
    matchUUID?: string;
    intervalID: any;
    ball: Ball;
    players: Player[] = [];
}