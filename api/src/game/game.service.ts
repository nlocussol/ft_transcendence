import { HttpException, HttpStatus, Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { Ball, GameData, Player, side} from './models/game.models';
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
MAX_SCORE = 5,
MAX_AFK_TIME = 20;

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
        newGame.players[0].posY = GAME_HEIGHT / 2 - (PLAYER_INITIAL_HEIGHT / 2);
        newGame.players[0].score = 0;
        newGame.players[0].canMove = true;
        newGame.players[0].velY = PLAYER_INITIAL_SPEED;
        newGame.players[1] = new Player();
        newGame.players[1].pseudo = this.poolQueue.shift();
        newGame.players[1].side = side.RIGHT;
        newGame.players[1].height = PLAYER_INITIAL_HEIGHT;
        newGame.players[1].width = PLAYER_INITIAL_WIDTH;
        newGame.players[1].posX = GAME_WIDTH - OFFSET_FROM_WALL;
        newGame.players[1].posY = GAME_HEIGHT / 2 - (PLAYER_INITIAL_HEIGHT / 2);
        newGame.players[1].score = 0;
        newGame.players[1].canMove = true;
        newGame.players[1].velY = PLAYER_INITIAL_SPEED;
        newGame.ball = new Ball();
        newGame.ball.canMove = true;
        newGame.ball.posX = GAME_WIDTH / 2;
        newGame.ball.posY = GAME_HEIGHT / 2;
        newGame.ball.radius = BALL_INITIAL_RADIUS;
        if (Math.floor(Math.random() * 2)) {
            newGame.ball.velX = BALL_INITIAL_SPEED;
        } else {
            newGame.ball.velX = -BALL_INITIAL_SPEED;
        }
        newGame.ball.velY = 0;
    }

    // Used in gateway
    findGameUUIDByPseudo(pseudo:string): string {
        for (let i = 0 ; i < this.gameInProgress.length ; i++) {
            if (this.gameInProgress[i].players[0].pseudo === pseudo ||
                this.gameInProgress[i].players[1].pseudo === pseudo) {
                    return this.gameInProgress[i].matchUUID;
                }
        }
        return undefined
    }

    findGameByUUID(UUID: string): GameData {
        let found = this.gameInProgress.find(game => game.matchUUID == UUID);
        if (found == undefined) {
            console.log("Les problemes")
        } else {
            return found;
        }
    }

    findPlayerIndex(game: GameData, pseudo: string): number {
        if (game.players[0].pseudo == pseudo) return 0;
        if (game.players[1].pseudo == pseudo) return 1;
    }

    startGame(game: GameData) {
        setTimeout(() => {
            game.intervalID = setInterval(() => {
                this.updateGame(game);
            }, environment.TICKRATE);
        }, 1000);
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
                game.players[1].endScreenWin = true;
                this.handleGameFinish(game)
            } 
            this.resetBall(game, 0);
        } else if ( game.ball.posX + game.ball.radius >= GAME_WIDTH) {
            game.players[0].score += 1;
            if (game.players[0].score == MAX_SCORE) {
                game.players[0].endScreenWin = true;
                this.handleGameFinish(game)
            }
            this.resetBall(game, 1);
        }
    }

    isCollidingTopBottom(game: GameData): boolean {
        if (game.ball.posY - game.ball.radius <= 0 || game.ball.posY + game.ball.radius >= GAME_HEIGHT) {
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
        game.ball.posX = GAME_WIDTH / 2;
        game.ball.posY = GAME_HEIGHT / 2;
        game.ball.radius = BALL_INITIAL_RADIUS;
        if (side == 0) {
            game.ball.velX = BALL_INITIAL_SPEED;
        } else {
            game.ball.velX = -BALL_INITIAL_SPEED;
        }
        game.ball.velY = 0;
    }

    handleGameFinish(game: GameData) {
        game.over = true;
        game.ball.canMove = false;
        game.players[0].canMove = false;
        game.players[1].canMove = false;
        clearInterval(game.intervalID);
        this.dbWriteService.fillMatchHistory(game);
    }

    movePlayer(game: GameData, playerIndex: number, movingUp: boolean, movingDown: boolean) {
        if (!game.players[playerIndex].canMove)
            return;
        if (movingUp && game.players[playerIndex].posY > 0) {
            game.players[playerIndex].posY -= game.players[playerIndex].velY;
        }
        if (movingDown && game.players[playerIndex].posY + game.players[playerIndex].height < GAME_HEIGHT) {
            game.players[playerIndex].posY += game.players[playerIndex].velY;
        }
    }

    handleDeconnexion(pseudo: string, gameUUID: string) {
        let game = this.findGameByUUID(gameUUID);
        if (game == undefined) return;

        game.ball.canMove = false;
        game.players[0].canMove = false;
        game.players[1].canMove = false;

        let playerIndex = this.findPlayerIndex(game, pseudo);
        game.players[playerIndex].AFK = true;
        let timeoutStartingTime = Date.now();
        let timeoutInterval = setInterval(() => {
            game.players[playerIndex].AFKTimer = (Date.now() - timeoutStartingTime) / 1000;
            if (game.players[playerIndex].AFK == false || game.over) {
                clearInterval(timeoutInterval);
            }
            if (game.players[playerIndex].AFKTimer > MAX_AFK_TIME) {

                // If both players are afk check which one was afk longer
                let otherPlayerIndex: number;
                playerIndex == 1 ? otherPlayerIndex = 0 : otherPlayerIndex = 1;
                game.players[otherPlayerIndex].score = MAX_SCORE;
                game.players[playerIndex].score = 0;
                this.handleGameFinish(game);
                clearInterval(timeoutInterval);
            }
            console.log(game.players[playerIndex].AFKTimer);
        }, 200)
    }

    handleReconnexion(pseudo:string, gameUUID: string) {
        let game = this.findGameByUUID(gameUUID);
        if (game == undefined) return;

        let playerIndex = this.findPlayerIndex(game, pseudo);
        if (game.players[playerIndex].AFK) game.players[playerIndex].AFK = false;

        if (!game.players[0].AFK && !game.players[1].AFK) {
            game.ball.canMove = true;
            game.players[0].canMove = true;
            game.players[1].canMove = true;
        }
    }

}
