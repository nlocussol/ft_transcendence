import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { GameData, Player } from '../models/game.models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService{
  private readonly API_ENDPOINT = 'http://localhost:3000/game'
  socket: any;
  payload$: BehaviorSubject<GameData> = new BehaviorSubject<GameData>(new GameData())
  constructor(private http: HttpClient) { }

  enterQueue(playerUUID: string) {
    console.log("angular:" + playerUUID);
    return this.http.post<any>(this.API_ENDPOINT, { UUID: playerUUID });
  }

  exitQueue(playerUUID: string) {
    const headers = { 'Player-To-Remove': `${playerUUID}` };
    return this.http.delete<any>(this.API_ENDPOINT, { headers });
  }

  // Returns the player's match UUID if one is started or undefined
  refreshQueue(playerUUID: string): Observable<GameData> {
    const headers = { 'PlayerUUID': `${playerUUID}` }
    return this.http.get<GameData>(this.API_ENDPOINT, { headers });
  }

  connectToSocket() {
    this.socket = io(this.API_ENDPOINT + "/inprogress");
    this.socket.on('joinGameRoom', (gamedata: any) => {
      console.log("ici")
    });
  }

  joinGameRoom(payload: any) {
    this.socket.emit('joinGameRoom', payload);
  }

  updateGame = () => {
    this.socket.on('updatePlayers', (payload: GameData) => {
      this.payload$.next(payload);
    })
    return this.payload$.asObservable();
    // return this.socket.on('updatePlayers', GameData);
  }

  sendPlayerInfo(payload: any) {
    this.socket.emit('keydown', payload);
  }

  // Ask API for game info 
  // getCurrentGameData(gameUUID: string | undefined): Observable<GameData> {
  //   return this.http.get<GameData>(this.API_URL + "/" + gameUUID)
  // }

  // patchPlayerData(gameUUID: string | undefined, playerData: Player | undefined, playerUUID: string) {
  //   return this.http.patch(this.API_URL + "/" + gameUUID, { 
  //     side: playerData?.side,
  //     UUID: playerData?.UUID,
  //     pos: playerData?.posY
  //    });
  // }
}
