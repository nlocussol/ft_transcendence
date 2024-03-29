export enum side {
  LEFT = 0,
  RIGHT = 1,
}

export class Ball {
  posX: number;
  posY: number;
  velX: number;
  velY: number;
  radius: number;
  canMove: boolean = false;
  isVisible: boolean = true;
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
  endScreenWin: boolean;
  canMove: boolean = false;
  AFK: boolean = true;
  AFKTimer: number = 0;
  AFKInterval: any;
}

export class GameData {
  inProgress: boolean = false;
  isOver: boolean = false;
  matchUUID?: string;
  intervalID: any;
  ball: Ball;
  players: Player[] = [];
  customGameMod: boolean;
  fieldColor: number;
  detailsColor: number;
}
