import { Injectable, OnModuleInit } from '@nestjs/common';
import { Ball, GameData, Player, side} from './models/game.models';

const GAMEWIDTH = 858,
GAMEHEIGHT = 525,
BALL_INITIAL_SPEED = 5,
BALL_INITIAL_RADIUS = 5,
PLAYER_INITIAL_WIDTH = 8,
PLAYER_INITIAL_HEIGHT = 70,
PLAYER_SPEED = 5,
OFFSET_FROM_WALL = 10;

@Injectable()
export class GameService implements OnModuleInit {
    poolQueue: string[] = [];
    public gameInProgress: GameData[] = [];

    constructor() {}

    onModuleInit() {
        this.gameInProgress.push(new GameData());
        console.log("ici");
        console.log(this.gameInProgress)
    }

    onModuleDestroy() {

    }

    newPlayer(side: number, playerUUID: string): Player {
        if (side == 0) {
            return ({
                posX: OFFSET_FROM_WALL,
                posY: GAMEHEIGHT / 2 - (PLAYER_INITIAL_HEIGHT / 2),
                side: side,
                height: PLAYER_INITIAL_HEIGHT,
                width: PLAYER_INITIAL_WIDTH,
                UUID: playerUUID,
                score: 0,
            });
        } else {
            return ({
                posX: GAMEWIDTH - OFFSET_FROM_WALL,
                posY: GAMEHEIGHT / 2 - (PLAYER_INITIAL_HEIGHT / 2),
                side: side,
                height: PLAYER_INITIAL_HEIGHT,
                width: PLAYER_INITIAL_WIDTH,
                UUID: playerUUID,
                score: 0,
            })
        }
  
    }

    startGame(matchUUID: string) {
        let game: GameData = this.gameInProgress.find(o => o.matchUUID === matchUUID)
        if (game === undefined) {
            console.log("Les problemes (game.service.ts:StartGame)")
        }
        game.ball = new Ball();
        game.ball.posX = GAMEWIDTH / 2;
        game.ball.posY = GAMEHEIGHT / 2;
        game.ball.radius = BALL_INITIAL_RADIUS;
        game.ball.velX = -BALL_INITIAL_SPEED;
        game.ball.velY = 0;
        //Need to clearinterval at the end of match
        game.intervalID = setInterval(this.updateGame.bind(this), 15, game);
    }

    movePlayer(playerIndex: number, isMovingUp: boolean, isMovingDown: boolean) {
        if (isMovingUp) {
            this.gameInProgress[0].players[playerIndex].posY -= PLAYER_SPEED;
        }
        if (isMovingDown) {
            this.gameInProgress[0].players[playerIndex].posY += PLAYER_SPEED;
        }
    }

    updateGame(game: GameData) {
        // Calcul balle
        game.ball.posX += game.ball.velX;
        game.ball.posY += game.ball.velY;
        this.handleCollision(game);
    }

    handleCollision(game: GameData) {
        // Check for collision with top and bottom of map
        if (this.isCollidingTopBottom(game)) {
            game.ball.velY *= - 1;
        }

        // Check for collision with paddles
        if (game.ball.velX < 0 && this.isCollidingP0(game)) {
            this.handleBallBounce(game);
        } else if (game.ball.velX > 0 && this.isCollidingP1(game)) {
            this.handleBallBounce(game);
        }

        if (game.ball.posX - game.ball.radius <= 0) {
            game.players[1].score += 1;
            this.resetBall(game);
        } else if ( game.ball.posX + game.ball.radius >= GAMEWIDTH) {
            game.players[0].score += 1;
            this.resetBall(game);
        }
    }

    resetBall(game: GameData) {
        game.ball.posX = GAMEWIDTH / 2;
        game.ball.posY = GAMEHEIGHT / 2;
        game.ball.radius = BALL_INITIAL_RADIUS;
        game.ball.velX = -BALL_INITIAL_SPEED;
        game.ball.velY = 0;
    }

    isCollidingTopBottom(game: GameData): boolean {
        if (game.ball.posY - game.ball.radius <= 0 || game.ball.posY + game.ball.radius >= GAMEHEIGHT) {
            return true;
        }
        return false;
    }

    isCollidingP0(game: GameData): boolean {
        if (game.ball.posY >= game.players[0].posY &&
            game.ball.posY <= game.players[0].posY + game.players[0].height) {
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

    // Handle bounce such as the angle of the bounce depends on where the impact with the paddle is
    handleBallBounce(game: GameData) {
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

    getGameImProgress() {
        const game = this.gameInProgress[0];
        delete game.intervalID;
        return game;
    }
}
