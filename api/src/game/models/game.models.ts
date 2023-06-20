export enum Side {
    LEFT = 0,
    RIGHT = 1
}

export class Ball {
    posX: number;
    posY: number;
    velX: number;
    velY: number;
    radius: number;
}

export class Player {
    side: number;
    UUID: string;
    socketID: string;
    posX: number;
    posY: number;
    height: number;
    width: number;
    score: number;
}

export class GameData {
    matchUUID?: string;
    ball: Ball;
    player: Player[] = [];
}