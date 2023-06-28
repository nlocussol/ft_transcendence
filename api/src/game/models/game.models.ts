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
    login?: string;
    posX?: number;
    posY?: number;
    velY?: number;
    height?: number;
    width?: number;
    score?: number;
    canMove: boolean = false;
}

export class GameData {
    matchUUID?: string;
    intervalID: any;
    ball: Ball;
    players: Player[] = [];
}