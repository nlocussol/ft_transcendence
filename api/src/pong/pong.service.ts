import { Injectable, } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { PongDataBack, side } from './pong.models';

@Injectable()
export class PongService {
    playerInQueue: string [] = [];
    gameInProgress: PongDataBack[] = [];

    constructor(
        pongGateway: PongGateway) {}
    
    addToQueue(playerUUID: string) {
        const index = this.playerInQueue.indexOf(playerUUID, 0);
        if (index == -1) {
            this.playerInQueue.push(playerUUID);
        }
    }

    removeFromQueue(playerUUID: string) {
        const index = this.playerInQueue.indexOf(playerUUID, 0);
        if (index > -1) {
            this.playerInQueue.splice(index, 1);
        }
    }

    checkQueue(playerUUID: string): PongDataBack {
        // Search if a player already has a game in progress, if so returns it
        for (let i = 0 ; i < this.gameInProgress.length ; i++) {
            let index = this.gameInProgress[i].players[0].UUID.indexOf(playerUUID, 0);
            if (index > - 1) {
                return this.gameInProgress[i];
            } else {
                let index = this.gameInProgress[i].players[1].UUID.indexOf(playerUUID, 0);
                if (index > - 1) {
                    return this.gameInProgress[i];
                }
            }
        }

        // Create a game if 2+ players are in queue and remove them from the queue
        let newPongData : PongDataBack;
        if (this.playerInQueue.length >= 2) {
            newPongData.matchUUID = crypto.randomUUID();
            // let newPlayer = new Player()
            // newPlayer.UUID = this.poolQueue.shift();
            // newPlayer.side = side.LEFT;
            // newGame.player.push(newPlayer);
            // let newPlayer2 = new Player()
            // newPlayer2.UUID = this.poolQueue.shift();
            // newPlayer2.side = side.RIGHT;
            // newGame.player.push(newPlayer2);
            // newGame.ball = new Ball();
            // this.gameInProgress.push(newGame);
            // this.startGame(this.findGame(newGame.matchUUID))
            this.playerInQueue.shift();
            this.playerInQueue.shift();
            return newPongData;
        }
        // Return empty game if not enough player in queue
        return newPongData;
    }
}
