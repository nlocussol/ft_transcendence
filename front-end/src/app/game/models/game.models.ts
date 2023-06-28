export enum side {
    LEFT = 0,
    RIGHT = 1,
}

export enum movement {
    UP = 0,
    DOWN = 1,
}

class Ball {
    posX?: number;
    posY?: number;
    velX?: number;
    velY?: number;
    radius?: number;
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
}

export class GameData {
    matchUUID?: string;
    players: Player[] = [];
    ball?: Ball;
    frontEndPlayer?: Player;
    backEndPlayer?: Player;
}