import { Injectable } from '@nestjs/common';
import { MatchData, PlayerData } from './interfaces/pong-data.interface';
import { log, table } from 'console';

@Injectable()
export class PongDataService {
    playerData: PlayerData[] = [];
    matchInProgress: MatchData[] = [];
    baseMatch: MatchData = {
        playerUUIDs: ["None"],
        matchUUID: crypto.randomUUID(),
        findOpponent: false,
        ballSpeed: 1,
        ballX: 0,
        ballY: 0,
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
            x: 0,
            y: 0,
        },
    }

    addPlayerData(newPlayer: PlayerData) {
        console.log(newPlayer);
        this.playerData.push(newPlayer);
    }

    matchmakingData(uuid: string): MatchData { 
        
        let newMatchData: MatchData = this.baseMatch;

        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].playerUUIDs.find(id => id === uuid) !== undefined) {
                console.log('FIND MATCH IN PROGRESS!');
                return this.matchInProgress[i];
            }
        }

        for (let i:number = 0; i < this.playerData.length; i++) {
            if (this.playerData[i].waitingMatch && this.playerData[i].playerUUID != uuid) {
                newMatchData.playerUUIDs = [uuid, this.playerData[i].playerUUID];
                newMatchData.findOpponent = true;
                newMatchData.ballSpeed = 1;
                // if (Math.round(Math.random()) == 1) newMatchData.ballXDirection = 1;
                // else newMatchData.ballXDirection = -1;
                // if (Math.round(Math.random()) == 1) newMatchData.ballYDirection = 1;
                // else newMatchData.ballYDirection = -1;
                newMatchData.ballXDirection = 1;
                newMatchData.ballYDirection = 1;
                newMatchData.ballX = this.playerData[i].gameWidth / 2;
                newMatchData.ballY = this.playerData[i].gameHeigth / 2;
                newMatchData.paddle2 = {
                        width: 25,
                        heigth: 100,
                        x: this.playerData[i].gameWidth - 25,
                        y: this.playerData[i].gameHeigth - 100,
                };
                this.playerData[i].waitingMatch = false;
                for (let j:number = 0; j < this.playerData.length; j++) {
                    if (this.playerData[j].playerUUID === uuid)
                        this.playerData[j].waitingMatch = false;
                }
                this.matchInProgress.push(newMatchData);
                return newMatchData;
            }
        }
        return newMatchData;
    }

    matchToUpdate(matchUUID: string, matchData: MatchData) {
        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].matchUUID === matchUUID) {
                this.matchInProgress[i] = matchData;
                return ;
            }
        }
    }

    matchToGet(matchUUID: string): MatchData {
        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].matchUUID === matchUUID) {
                console.log(this.matchInProgress[i])
                return this.matchInProgress[i];
            }
        }
        console.log('MATCH TO GET NOT FOUND!')
        return this.baseMatch
    }
}
