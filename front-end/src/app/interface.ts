export enum movement {
  UP = 0,
  DOWN = 1,
}

interface Paddle {
  width: number;
  heigth: number;
  x: number;
  y: number;
}

export interface MatchData {
  playerUUIDs: string[];
  matchUUID: string;
  findOpponent: boolean;
  ballSpeed: number;
  ballX: number;
  ballY: number;
  ballRadius: number;
  ballXDirection: number;
  ballYDirection: number;
  player1Score: number;
  player2Score: number;
  paddle1: Paddle;
  paddle2: Paddle;
  side: number;
}
