import { HttpException, HttpStatus, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { Ball, GameData, Player, side} from './models/game.models';
import { SERVER_TICKRATE } from './environment';
import { DbWriterService } from 'src/db-writer/db-writer.service';

const GAMEWIDTH = 858,
GAMEHEIGHT = 525,
BALL_INITIAL_SPEED = 5,
BALL_INITIAL_RADIUS = 5,
PLAYER_INITIAL_WIDTH = 8,
PLAYER_INITIAL_HEIGHT = 70,
PLAYER_INITIAL_SPEED = 5,
OFFSET_FROM_WALL = 10,
MAX_SCORE = 1;

@Injectable()
export class GameService implements OnModuleInit {
    poolQueue: string[] = [];
    public gameInProgress: GameData[] = [];

    constructor(private dbWriteService: DbWriterService) {}

    onModuleInit() {
    }

    addPlayerToQueue(pseudo: string) {
        if (this.poolQueue.indexOf(pseudo) == -1) {
            this.poolQueue.push(pseudo);
        }
    }

    removePlayerFromQueue(pseudo: string) {
        let playerToRemove = this.poolQueue.indexOf(pseudo);
        if (playerToRemove != -1) {
            this.poolQueue.splice(playerToRemove, 1);
        }
    }

    refreshQueue(pseudo: string) {
        // Search if player is already in a game, if so return game's UUID
        for (let i = 0 ; i < this.gameInProgress.length ; i++) {
            if (this.gameInProgress[i].players[0].pseudo === pseudo ||
                this.gameInProgress[i].players[1].pseudo === pseudo) {
                    return { matchUUID: this.gameInProgress[i].matchUUID };
                }
        }

        // Create a new game if 2+ players are in queue, else throw an error
        if (this.poolQueue.length >= 2) {
            const newGame = new GameData();
            this.setupNewGame(newGame);
            this.gameInProgress.push(newGame);
            this.startGame(this.gameInProgress[this.gameInProgress.length - 1])
            return { matchUUID: newGame.matchUUID };
        }
        else {
            throw new HttpException('Not enough player in queue', HttpStatus.FORBIDDEN);
        }
    }

    setupNewGame(newGame: GameData) {
        newGame.matchUUID = crypto.randomUUID();
        newGame.players[0] = new Player();
        newGame.players[0].pseudo = this.poolQueue.shift();
        newGame.players[0].side = side.LEFT;
        newGame.players[0].height = PLAYER_INITIAL_HEIGHT;
        newGame.players[0].width = PLAYER_INITIAL_WIDTH;
        newGame.players[0].posX = OFFSET_FROM_WALL;
        newGame.players[0].posY = GAMEHEIGHT / 2 - (PLAYER_INITIAL_HEIGHT / 2);
        newGame.players[0].score = 0;
        newGame.players[0].canMove = true;
        newGame.players[0].velY = PLAYER_INITIAL_SPEED;
        newGame.players[1] = new Player();
        newGame.players[1].pseudo = this.poolQueue.shift();
        newGame.players[1].side = side.RIGHT;
        newGame.players[1].height = PLAYER_INITIAL_HEIGHT;
        newGame.players[1].width = PLAYER_INITIAL_WIDTH;
        newGame.players[1].posX = GAMEWIDTH - OFFSET_FROM_WALL;
        newGame.players[1].posY = GAMEHEIGHT / 2 - (PLAYER_INITIAL_HEIGHT / 2);
        newGame.players[1].score = 0;
        newGame.players[1].canMove = true;
        newGame.players[1].velY = PLAYER_INITIAL_SPEED;
        newGame.ball = new Ball();
        newGame.ball.canMove = true;
        newGame.ball.posX = GAMEWIDTH / 2;
        newGame.ball.posY = GAMEHEIGHT / 2;
        newGame.ball.radius = BALL_INITIAL_RADIUS;
        if (Math.floor(Math.random() * 2)) {
            newGame.ball.velX = BALL_INITIAL_SPEED;
        } else {
            newGame.ball.velX = -BALL_INITIAL_SPEED;
        }
        newGame.ball.velY = 0;
    }

    // Used in gateway
    findGameByPlayer(pseudo:string): string {
        for (let i = 0 ; i < this.gameInProgress.length ; i++) {
            if (this.gameInProgress[i].players[0].pseudo === pseudo ||
                this.gameInProgress[i].players[1].pseudo === pseudo) {
                    return this.gameInProgress[i].matchUUID;
                }
        }
        return undefined
    }

    findGameByUUID(UUID: string) {
        let found = this.gameInProgress.find(game => game.matchUUID == UUID);
        if (found == undefined) {
            console.log("Les problemes")
        } else {
            return found.matchUUID;
        }
    }

    startGame(game: GameData) {
        game.intervalID = setInterval(() => {
            this.updateGame(game);
        }, SERVER_TICKRATE);
    }

    updateGame(game: GameData) {
        if (game.ball.canMove) {
            game.ball.posX += game.ball.velX;
            game.ball.posY += game.ball.velY;
            this.handleCollision(game)
        }
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
            if (game.players[1].score == MAX_SCORE) {
                this.handleGameEnd(game, 1);
            } 
            this.resetBall(game, 0);
        } else if ( game.ball.posX + game.ball.radius >= GAMEWIDTH) {
            game.players[0].score += 1;
            if (game.players[0].score == MAX_SCORE) {
                this.handleGameEnd(game, 0);
            }
            this.resetBall(game, 1);
        }
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

    resetBall(game: GameData, side: number) {
        game.ball.posX = GAMEWIDTH / 2;
        game.ball.posY = GAMEHEIGHT / 2;
        game.ball.radius = BALL_INITIAL_RADIUS;
        if (side == 0) {
            game.ball.velX = BALL_INITIAL_SPEED;
        } else {
            game.ball.velX = -BALL_INITIAL_SPEED;
        }
        game.ball.velY = 0;
    }

    handleGameEnd(game: GameData, winner: number) {
        game.ball.canMove = false;
        clearInterval(game.intervalID);
        console.log("WIN");
        this.dbWriteService.fillMatchHistory(game);
    }


    // startGame(matchUUID: string) {
    //     let game: GameData = this.gameInProgress.find(o => o.matchUUID === matchUUID)
    //     if (game === undefined) {
    //         console.log("Les problemes (game.service.ts:StartGame)")
    //     }
    //     game.ball = new Ball();
    //     game.ball.posX = GAMEWIDTH / 2;
    //     game.ball.posY = GAMEHEIGHT / 2;
    //     game.ball.radius = BALL_INITIAL_RADIUS;
    //     game.ball.velX = -BALL_INITIAL_SPEED;
    //     game.ball.velY = 0;
    //     //Need to clearinterval at the end of match
    //     game.intervalID = setInterval(this.updateGame.bind(this), 15, game);
    // }

    // movePlayer(playerIndex: number, isMovingUp: boolean, isMovingDown: boolean) {
    //     if (isMovingUp) {
    //         this.gameInProgress[0].players[playerIndex].posY -= PLAYER_SPEED;
    //     }
    //     if (isMovingDown) {
    //         this.gameInProgress[0].players[playerIndex].posY += PLAYER_SPEED;
    //     }
    // }

    // getGameImProgress() {
    // }
}
