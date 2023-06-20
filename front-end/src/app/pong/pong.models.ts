export enum side {
    LEFT = 0,
    RIGHT = 1
}

interface Ball {
    posX: number;
    posY: number;
    velX: number;
    velY: number;
    colorHue: number;
}

interface Player {
    UUID: string;
    posX: number;
    posY: number;
    velX: number;
    velY: number;
    side: number;
    colorHue: number;
}

export interface PongDataFront {
    matchUUID?: string;
    players?: Player[];
    ball?: Ball;
    backgroundColor?: number;
}