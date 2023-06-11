interface paddle {
    width: number;
    heigth: number;
    x: number;
    y: number;
}

export interface PlayerData {
    playerUUID: string;
    waitingMatch: boolean;
    gameHeigth: number;
    gameWidth: number;
    playerSide?: string;
}

export interface MatchData {
    playerUUIDs?: string[];
    matchUUID?: string;
    findOpponent?: boolean;
    ballSpeed?: number;
    ballX?: number;
    ballY?: number;
    ballRadius?: number;
    ballXDirection?: number;
    ballYDirection?: number;
    player1Score?: number;
    player2Score?: number;
    paddle1?: paddle;
    paddle2?: paddle;
}
