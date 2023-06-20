export enum Side {
    LEFT = 0,
    RIGHT = 1,
}

class Ball {
    posX?: number;
    posY?: number;
    velX?: number;
    velY?: number;
}

export class Player {
    side?: number;
    socketID?: string;
    UUID?: string;
    posX?: number;
    posY?: number;
    height?: number;
    width?: number;
    score?: number;
}

export class GameData {
    matchUUID?: string;
    player: Player[] = [];
    ball?: Ball;
    player1Pos?: number;
    player2Pos?: number;
}