import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { GameData, Player, Side, Ball } from './models/game.models';

const GAMEWIDTH = 858,
GAMEHEIGHT = 525,
BALL_INITIAL_SPEED = 5,
BALL_INITIAL_RADIUS = 5,
PLAYER_INITIAL_WIDTH = 5,
PLAYER_INITIAL_HEIGHT = 50,
OFFSET_FROM_WALL = 50;

@Injectable()
export class GameService implements OnModuleInit {
    poolQueue: string[] = [];
    gameInProgress: GameData[] = [];

    onModuleInit() {
        
    }

    onModuleDestroy() {

    }

    addToQueue(playerUUID: string) {
        const index = this.poolQueue.indexOf(playerUUID, 0);
        if (index == -1) {
            this.poolQueue.push(playerUUID);
        }
    }

    removeFromQueue(playerUUID: string) {
        const index = this.poolQueue.indexOf(playerUUID, 0);
        if (index > -1) {
            this.poolQueue.splice(index, 1);
        }
    }

    checkQueue(playerUUID: string): GameData {
        // Search if a player already has a game in progress, if so returns it
        for (let i = 0 ; i < this.gameInProgress.length ; i++) {
            let index = this.gameInProgress[i].player[0].UUID.indexOf(playerUUID, 0);
            if (index > - 1) {
                return this.gameInProgress[i];
            } else {
                let index = this.gameInProgress[i].player[1].UUID.indexOf(playerUUID, 0);
                if (index > - 1) {
                    return this.gameInProgress[i];
                }
            }
        }

        // Create a game if 2+ players are in queue and remove them from the queue
        let newGame = new GameData();
        if (this.poolQueue.length >= 2) {
            newGame.matchUUID = crypto.randomUUID();
            let newPlayer = new Player()
            newPlayer.UUID = this.poolQueue.shift();
            newPlayer.side = Side.RIGHT;
            newGame.player.push(newPlayer);
            let newPlayer2 = new Player()
            newPlayer2.UUID = this.poolQueue.shift();
            newPlayer2.side = Side.LEFT;
            newGame.player.push(newPlayer2);
            newGame.ball = new Ball();
            this.gameInProgress.push(newGame);
            this.startGame(this.findGame(newGame.matchUUID))
            return newGame;
        }
        // Return empty game if not enough player in queue
        return newGame;
    }

    findGame(gameUUID: string): number {
        for (let gameIndex : number = 0; gameIndex < this.gameInProgress.length; gameIndex++) {
            if (this.gameInProgress[gameIndex].matchUUID == gameUUID) return gameIndex;
        }
    }

    sendGameData(gameUUID: string) {
        return this.gameInProgress[this.findGame(gameUUID)];
    }

    patchPlayerPos(gameUUID: string, body: Player, playerUUID: string) {
        let gameIndex : number = this.findGame(gameUUID);
        if (body.UUID == this.gameInProgress[gameIndex].player[Side.LEFT].UUID) {
            this.gameInProgress[gameIndex].player[Side.LEFT].posY = body.posY;
        } else {
            this.gameInProgress[gameIndex].player[Side.RIGHT].posY = body.posY;
        }
    }

    startGame(gameIndex: number) {
        this.gameInProgress[gameIndex].ball.posX = GAMEWIDTH / 2;
        this.gameInProgress[gameIndex].ball.posY = GAMEHEIGHT / 2;
        this.gameInProgress[gameIndex].ball.radius = BALL_INITIAL_RADIUS;
        this.gameInProgress[gameIndex].ball.velX = -BALL_INITIAL_SPEED;
        this.gameInProgress[gameIndex].ball.velY = 0;
        this.gameInProgress[gameIndex].player[0].posY = GAMEHEIGHT / 2;
        this.gameInProgress[gameIndex].player[1].posY = GAMEHEIGHT / 2;
        this.gameInProgress[gameIndex].player[0].posX = OFFSET_FROM_WALL;
        this.gameInProgress[gameIndex].player[1].posX = GAMEWIDTH - OFFSET_FROM_WALL;
        this.gameInProgress[gameIndex].player[0].height = PLAYER_INITIAL_HEIGHT;
        this.gameInProgress[gameIndex].player[1].height = PLAYER_INITIAL_HEIGHT;
        this.gameInProgress[gameIndex].player[0].width = PLAYER_INITIAL_WIDTH;
        this.gameInProgress[gameIndex].player[1].width = PLAYER_INITIAL_WIDTH;

    }

    gameLoop(gameIndex : number) {
        setTimeout(() => {
            this.moveBall(gameIndex);
        }, 10);
    }

    moveBall(gameIndex: number) {
        this.gameInProgress[gameIndex].ball.posX += this.gameInProgress[gameIndex].ball.velX;
        this.gameInProgress[gameIndex].ball.posY += this.gameInProgress[gameIndex].ball.velY;
        this.handleCollision(gameIndex);
        this.gameLoop(gameIndex);
    }

    handleCollision(gameIndex: number) {
        if (this.isCollidingWalls(gameIndex)) {
            this.gameInProgress[gameIndex].ball.velY *= -1;
        }
        if (this.gameInProgress[gameIndex].ball.velX < 0 && this.isCollidingP0(gameIndex)) {
            this.handleCollisionWithPaddle(gameIndex, 0);
        } else if (this.isCollidingP1(gameIndex)) {
            this.handleCollisionWithPaddle(gameIndex, 1);
        }
    }

    isCollidingWalls(gameIndex: number): boolean {
        if (this.gameInProgress[gameIndex].ball.posY - this.gameInProgress[gameIndex].ball.radius <= 0 ||
            this.gameInProgress[gameIndex].ball.posY + this.gameInProgress[gameIndex].ball.radius >= GAMEHEIGHT ) {
                return true;
            }
            return false;
    }

    isCollidingP0(gameIndex: number): boolean {
        if (this.gameInProgress[gameIndex].ball.posY >= this.gameInProgress[gameIndex].player[0].posY &&
            this.gameInProgress[gameIndex].ball.posY <= this.gameInProgress[gameIndex].player[0].posY + this.gameInProgress[gameIndex].player[0].height) {
                if (this.gameInProgress[gameIndex].ball.posX <= this.gameInProgress[gameIndex].player[0].posX + this.gameInProgress[gameIndex].player[0].width) {
                    return true;
                }
            }
        return false;
    }

    isCollidingP1(gameIndex: number): boolean {
        return false;
    }

    handleCollisionWithPaddle(gameIndex: number, player: number) {

    }

    getGameInProgress(): GameData[] {
        return this.gameInProgress;
    }
}
