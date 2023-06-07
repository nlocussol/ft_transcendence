import { Injectable } from '@nestjs/common';
import { MatchData, NoMatchFound, PlayerData } from './interfaces/pong-data.interface';

@Injectable()
export class PongDataService {
    playerData: PlayerData[] = [];
    matchInProgress: MatchData[] = [];
    
    addPlayerData(newPlayer: PlayerData) {
        console.log(newPlayer);
        this.playerData.push(newPlayer);
    }

    matchmakingData(uuid: string): MatchData | NoMatchFound { 
        console.log('IDDD', uuid);
        let newMatchData: MatchData = null;
        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].playerUUIDs.find(id => id === uuid) !== undefined) {
                return this.matchInProgress[i];
            }
        }
        for (let i:number = 0; i < this.playerData.length; i++) {
            if (this.playerData[i].waitingMatch && this.playerData[i].playerUUID != uuid) {
                newMatchData =  {
                    playerUUIDs: [uuid, this.playerData[i].playerUUID],
                    matchUUID: crypto.randomUUID(),
                    findOpponent: true,
                    ballSpeed: 1,
                    ballX: this.playerData[i].gameWidth / 2,
                    ballY: this.playerData[i].gameHeigth / 2,
                    ballXDirection: 0,
                    ballYDirection:0,
                    player1Score: 0,
                    player2Score: 0,
                    paddle1: {
                        width: 25,
                        heigth: 100,
                        x: 0,
                        y: 0,
                    },  
                    paddle2: {
                        width: 25,
                        heigth: 100,
                        x: this.playerData[i].gameWidth - 25,
                        y: this.playerData[i].gameHeigth - 100,
                    },
                }
                this.playerData[i].waitingMatch = false;
                for (let i:number = 0; i < this.playerData.length; i++) {
                    if (this.playerData[i].playerUUID === uuid)
                        this.playerData[i].waitingMatch = false;
                }
                this.matchInProgress.push(newMatchData);
                return newMatchData;
            }
        }
        return {findOpponent: false};
    }
}
