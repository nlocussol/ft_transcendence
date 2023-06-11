import { Injectable } from '@nestjs/common';
import { MatchData, PlayerData } from './interfaces/pong-data.interface';
import { log, table } from 'console';

@Injectable()
export class PongDataService {
    playerData: PlayerData[] = [];
    matchInProgress: MatchData[] = [];
    intervalId: any;


    moveball(match: MatchData) {
        match.ballX += match.ballSpeed * match.ballXDirection;
        match.ballY += match.ballSpeed * match.ballYDirection;
    }

    createBall(match:MatchData,player: PlayerData) {
        match.ballSpeed = 1;
        match.ballXDirection = 1;
        match.ballYDirection = 1;
        match.ballX = player.gameWidth / 2;
        match.ballY = player.gameHeigth / 2;
    }

    checkCollision(matchData: MatchData, player: PlayerData) {
        if (matchData.ballY <= 0 + matchData.ballRadius) matchData.ballYDirection *= -1;
        if (matchData.ballY >= player.gameHeigth - matchData.ballRadius) matchData.ballYDirection *= -1;
        if (matchData.ballX <= 0) {
          matchData.player2Score++;
          this.createBall(matchData, player);
          return;
        }
        if (matchData.ballX >= player.gameWidth) {
          matchData.player1Score++;
          this.createBall(matchData, player);
          return;
        }
        if (matchData.ballX <= matchData.paddle1.x + matchData.paddle1.width + matchData.ballRadius) {
          if (matchData.ballY > matchData.paddle1.y && matchData.ballY < matchData.paddle1.y + matchData.paddle1.heigth) {
            matchData.ballX = matchData.paddle1.x + matchData.paddle1.width + matchData.ballRadius; // if ball gets stuck
            matchData.ballXDirection *= -1;
            matchData.ballSpeed++;
          }
        }
        if (matchData.ballX >= matchData.paddle2.x - matchData.ballRadius) {
          if (matchData.ballY > matchData.paddle2.y && matchData.ballY < matchData.paddle2.y + matchData.paddle2.heigth) {
            matchData.ballX = matchData.paddle2.x - matchData.ballRadius; // if ball gets stuck
            matchData.ballXDirection *= -1;
            matchData.ballSpeed++;
          }
        }
    }
    
    nextTick(match: MatchData, player: PlayerData) {
        this.intervalId = setTimeout(() => {
            this.moveball(match);
            this.checkCollision(match, player);
            this.nextTick(match, player);
        }, 10);
    }

    clearGame(match: MatchData, player: PlayerData) {
        match.paddle1 = {
            width: 25,
            heigth: 100,
            x: 0,
            y: 0,
        };
        match.paddle2 = {
            width: 25,
            heigth: 100,
            x: player.gameWidth - 25,
            y: player.gameHeigth - 100,
        };
        match.ballSpeed = 1;
        match.ballX = player.gameWidth / 2;
        match.ballY = player.gameHeigth / 2;
        match.ballXDirection = 1;
        match.ballYDirection = 1;
        this.nextTick(match, player);
    }

    startGame(match: MatchData, player: PlayerData) {
        match.ballRadius = 12.5;
        match.player1Score = 0;
        match.player2Score = 0;
        this.clearGame(match, player);
    }

    addPlayerData(newPlayer: PlayerData) {
        console.log(newPlayer);
        this.playerData.push(newPlayer);
    }

    matchmakingData(uuid: string): MatchData {
        let newMatchData: MatchData = {
            findOpponent: false,
        };

        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].playerUUIDs.find(id => id === uuid) !== undefined) {
                console.log('FIND MATCH IN PROGRESS!');
                return this.matchInProgress[i];
            }
        }

        for (let i:number = 0; i < this.playerData.length; i++) {
            if (this.playerData[i].waitingMatch && this.playerData[i].playerUUID != uuid) {
                newMatchData = {
                    playerUUIDs: [uuid, this.playerData[i].playerUUID],
                    matchUUID: crypto.randomUUID(),
                    findOpponent: true,
                }
                this.playerData[i].waitingMatch = false;
                for (let j:number = 0; j < this.playerData.length; j++) {
                    if (this.playerData[j].playerUUID === uuid)
                        this.playerData[j].waitingMatch = false;
                }
                this.matchInProgress.push(newMatchData);
                this.startGame(this.matchInProgress.find(match => match.matchUUID === newMatchData.matchUUID), this.playerData[i])
                return newMatchData;
            }
        }
        return newMatchData;
    }

    matchToUpdate(matchUUID: string, matchData: MatchData) {
        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].matchUUID === matchUUID) {
                this.matchInProgress[i].paddle1 = matchData.paddle1;
                this.matchInProgress[i].paddle2 = matchData.paddle2;
                return ;
            }
        }
    }

    matchToGet(matchUUID: string): MatchData {
        for (let i:number = 0; i < this.matchInProgress.length; i++) {
            if (this.matchInProgress[i].matchUUID === matchUUID) {
                // console.log(this.matchInProgress[i])
                return this.matchInProgress[i];
            }
        }
        console.log('MATCH TO GET NOT FOUND!')
        let errorMatch: MatchData
        errorMatch.findOpponent = false;
        return errorMatch;
    }
}
