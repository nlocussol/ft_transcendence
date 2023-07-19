import { Injectable } from '@nestjs/common';
import { Ball, GameData, Player, side } from './models/game.models';
import { environment } from './environment';
import { DbWriterService } from 'src/db-writer/db-writer.service';

const GAME_WIDTH = 858,
  GAME_HEIGHT = 525,
  BALL_INITIAL_SPEED = 5,
  BALL_INITIAL_RADIUS = 5,
  PLAYER_INITIAL_WIDTH = 8,
  PLAYER_INITIAL_HEIGHT = 70,
  PLAYER_INITIAL_SPEED = 5,
  OFFSET_FROM_WALL = 10,
  MAX_SCORE = 1,
  MAX_AFK_TIME = 10;

@Injectable()
export class GameService {
  public gameInProgress: GameData[] = [];
  public customGameInProgress: GameData[] = [];

  constructor(private dbWriteService: DbWriterService) {}

  findGameUUIDWithLogin(login: string): string {
    for (let i = 0; i < this.gameInProgress.length; i++) {
      if (
        this.gameInProgress[i].players[0].login === login ||
        this.gameInProgress[i].players[1].login === login
      ) {
        return this.gameInProgress[i].matchUUID;
      }
    }

    for (let i = 0; i < this.customGameInProgress.length; i++) {
      if (
        this.customGameInProgress[i].players[0].login === login ||
        this.customGameInProgress[i].players[1].login === login
      ) {
        return this.customGameInProgress[i].matchUUID;
      }
    }
    return undefined;
  }

  findGameByUUID(UUID: string): GameData {
    if (this.gameInProgress.length < 1) return undefined;
    let found = this.gameInProgress.find((game) => game.matchUUID === UUID);
    if (found == undefined) {
      console.log('findGameByUUID: Can not found a match by UUID');
    } else {
      return found;
    }
  }

  findPlayerIndex(game: GameData, login: string): number {
    let playerIndex: number
    game.players[0].login == login ? playerIndex = 0 : playerIndex = 1
    return playerIndex
  }

  startGame(game: GameData) {
    setTimeout(() => {
      game.inProgress = true;
      game.isOver = false;
      game.ball.canMove = true;
      game.players[0].canMove = true;
      game.players[1].canMove = true;
      game.intervalID = setInterval(() => {
        this.updateGame(game);
      }, environment.TICKRATE);
    }, 500);
  }

  updateGame(game: GameData) {
    if (game.ball.canMove) {
      if (game.customGameMod) {
        game.detailsColor += 0.5;
        game.fieldColor += 0.5;
      }
      game.ball.posX += game.ball.velX;
      game.ball.posY += game.ball.velY;
      if (game.customGameMod) {
        if (game.ball.posX > 301 && game.ball.posX < 557) {
          game.ball.isVisible = false;
        } else {
          game.ball.isVisible = true;
        }
      }
      this.handleCollision(game);
    }
  }

  handleCollision(game: GameData) {
    // Check for collision with top and bottom of map
    if (this.isCollidingTopBottom(game)) {
      game.ball.velY *= -1;
    }
    // Check for collision with paddles
    if (game.ball.velX < 0 && this.isCollidingP0(game)) {
      this.handleBallBounce(game);
    } else if (game.ball.velX > 0 && this.isCollidingP1(game)) {
      this.handleBallBounce(game);
    }

    if (game.ball.posX - game.ball.radius <= 0) {
      game.players[1].score += 1;
      if (game.players[1].score == MAX_SCORE) {
        game.players[1].endScreenWin = true;
        this.handleGameFinish(game);
      }
      this.resetBall(game, 0);
    } else if (game.ball.posX + game.ball.radius >= GAME_WIDTH) {
      game.players[0].score += 1;
      if (game.players[0].score == MAX_SCORE) {
        game.players[0].endScreenWin = true;
        this.handleGameFinish(game);
      }
      this.resetBall(game, 1);
    }
  }

  isCollidingTopBottom(game: GameData): boolean {
    if (
      game.ball.posY - game.ball.radius <= 0 ||
      game.ball.posY + game.ball.radius >= GAME_HEIGHT
    ) {
      return true;
    }
    return false;
  }

  isCollidingP0(game: GameData): boolean {
    if (
      game.ball.posY >= game.players[0].posY &&
      game.ball.posY <= game.players[0].posY + game.players[0].height
    ) {
      if (game.ball.posX <= game.players[0].posX + game.players[0].width) {
        return true;
      }
    }
    return false;
  }

  isCollidingP1(game: GameData): boolean {
    if (
      game.ball.posY >= game.players[1].posY &&
      game.ball.posY <= game.players[1].posY + game.players[1].height
    ) {
      if (game.ball.posX + game.ball.radius >= game.players[1].posX) {
        return true;
      }
    }
    return false;
  }

  handleBallBounce(game: GameData) {
    if (game.customGameMod) {
      game.ball.velX *= 1.1;
      game.ball.velY *= 1.1;
      game.players[0].velY +=1;
      game.players[1].velY +=1;
    } else {
      game.ball.velX *= 1.05;
      game.ball.velY *= 1.05;
    }
    if (game.ball.velX < 0) {
      game.ball.velX *= -1;
      const middlePaddleY = game.players[0].posY + game.players[0].height / 2;
      const differenceY = middlePaddleY - (game.ball.posY + game.ball.radius);
      const factor = game.players[0].height / 2 / game.ball.velX;
      game.ball.velY = (differenceY / factor) * -1;
    } else {
      game.ball.velX *= -1;
      const middlePaddleY = game.players[1].posY + game.players[1].height / 2;
      const differenceY = middlePaddleY - (game.ball.posY + game.ball.radius);
      const factor = game.players[1].height / 2 / game.ball.velX;
      game.ball.velY = (differenceY / factor) * 1;
    }
  }

  resetBall(game: GameData, side: number) {
    game.ball.posX = GAME_WIDTH / 2;
    game.ball.posY = GAME_HEIGHT / 2;
    game.ball.radius = BALL_INITIAL_RADIUS;
    if (side == 0) {
      game.ball.velX = BALL_INITIAL_SPEED;
    } else {
      game.ball.velX = -BALL_INITIAL_SPEED;
    }
    game.ball.velY = 0;
    game.players[0].velY = PLAYER_INITIAL_SPEED;
    game.players[1].velY = PLAYER_INITIAL_SPEED;
  }

  handleGameFinish(game: GameData) {
    game.inProgress = false;
    game.isOver = true;
    game.ball.canMove = false;
    game.players[0].canMove = false;
    game.players[1].canMove = false;
    if (!game.customGameMod) {
      this.dbWriteService.fillMatchHistory(game);
    }
    clearInterval(game.intervalID);
    setTimeout(() => {
      const gameIndex = this.gameInProgress.indexOf(game, 0);
      this.gameInProgress.splice(gameIndex, 1);
    }, 1000);
  }

  movePlayer(
    game: GameData,
    playerIndex: number,
    movingUp: boolean,
    movingDown: boolean,
  ) {
    if (!game.players[playerIndex].canMove) return;
    if (movingUp && game.players[playerIndex].posY > 0) {
      game.players[playerIndex].posY -= game.players[playerIndex].velY;
    }
    if (
      movingDown &&
      game.players[playerIndex].posY + game.players[playerIndex].height <
        GAME_HEIGHT
    ) {
      game.players[playerIndex].posY += game.players[playerIndex].velY;
    }
  }

  handleDeconnexion(login: string) {
    const gameUUID = this.findGameUUIDWithLogin(login);
    const game = this.findGameByUUID(gameUUID);
    if (game == undefined) return;

    game.ball.canMove = false;
    game.players[0].canMove = false;
    game.players[1].canMove = false;

    let playerIndex = this.findPlayerIndex(game, login);
    // console.log("handleDcService: ", game.players[playerIndex].pseudo)
    game.players[playerIndex].AFK = true;
    let timeoutStartingTime = Date.now();
    let timeoutInterval = setInterval(() => {
      game.players[playerIndex].AFKTimer =
        (Date.now() - timeoutStartingTime) / 1000;
      if (game.players[playerIndex].AFK == false || game.isOver) {
        clearInterval(timeoutInterval);
      }
      if (game.players[playerIndex].AFKTimer > MAX_AFK_TIME) {
        // If both players are afk check which one was afk longer
        let otherPlayerIndex: number;
        playerIndex == 1 ? (otherPlayerIndex = 0) : (otherPlayerIndex = 1);
        game.players[otherPlayerIndex].score = MAX_SCORE;
        game.players[playerIndex].score = 0;
        this.handleGameFinish(game);
        clearInterval(timeoutInterval);
      }
    }, 200);
  }

  handleReconnexion(login: string, gameUUID: string) {
    let game = this.findGameByUUID(gameUUID);
    if (game == undefined) return;

    let playerIndex = this.findPlayerIndex(game, login);
    // console.log("handleReco: ", game.players[playerIndex].pseudo)
    if (game.players[playerIndex].AFK) {
      game.players[playerIndex].AFK = false;
    }

    if (!game.players[0].AFK && !game.players[1].AFK) {
      game.ball.canMove = true;
      game.players[0].canMove = true;
      game.players[1].canMove = true;
    }
  }

  createNewGame(customGameMod: boolean): GameData {
    let newGame = new GameData();
    newGame.matchUUID = crypto.randomUUID();
    newGame.customGameMod = customGameMod;
    newGame.players[0] = new Player();
    newGame.players[0].side = side.LEFT;
    newGame.players[0].height = PLAYER_INITIAL_HEIGHT;
    newGame.players[0].width = PLAYER_INITIAL_WIDTH;
    newGame.players[0].posX = OFFSET_FROM_WALL;
    newGame.players[0].posY = GAME_HEIGHT / 2 - PLAYER_INITIAL_HEIGHT / 2;
    newGame.players[0].score = 0;
    newGame.players[0].canMove = false;
    newGame.players[0].velY = PLAYER_INITIAL_SPEED;
    newGame.players[1] = new Player();
    newGame.players[1].side = side.RIGHT;
    newGame.players[1].height = PLAYER_INITIAL_HEIGHT;
    newGame.players[1].width = PLAYER_INITIAL_WIDTH;
    newGame.players[1].posX = GAME_WIDTH - OFFSET_FROM_WALL - PLAYER_INITIAL_WIDTH;
    newGame.players[1].posY = GAME_HEIGHT / 2 - PLAYER_INITIAL_HEIGHT / 2;
    newGame.players[1].score = 0;
    newGame.players[1].canMove = false;
    newGame.players[1].velY = PLAYER_INITIAL_SPEED;
    newGame.ball = new Ball();
    newGame.ball.canMove = false;
    newGame.ball.posX = GAME_WIDTH / 2;
    newGame.ball.posY = GAME_HEIGHT / 2;
    newGame.ball.radius = BALL_INITIAL_RADIUS;
    newGame.fieldColor = 0;
    newGame.detailsColor = 360;
    if (Math.floor(Math.random() * 2)) {
      newGame.ball.velX = BALL_INITIAL_SPEED;
    } else {
      newGame.ball.velX = -BALL_INITIAL_SPEED;
    }
    newGame.ball.velY = 0;
    newGame.inProgress = true;
    newGame.isOver = false;
    if (customGameMod) {
      // Add custom configuration
    }
    this.gameInProgress.push(newGame);
    this.startGame(newGame);
    return newGame;
  }

  createPrivateGame(gameData: any) {
    const newGame = this.createNewGame(false);
    newGame.players[0].login = gameData.player1;
    newGame.players[0].pseudo = gameData.player1pseudo;
    newGame.players[1].login = gameData.player2;
    newGame.players[1].pseudo = gameData.player2pseudo;
  }

}
