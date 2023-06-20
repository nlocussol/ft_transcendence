import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { GameData, Player } from '../models/game.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService{
  private readonly API_ENDPOINT = 'http://localhost:3000/game'
  socket: any;
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
    this.socket.on('updatePlayers', (gamedata: any) => {
      console.log("ici")
    });
  }

  emitToSocket(payload: any) {
    this.socket.emit('updatePlayers', payload);
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
