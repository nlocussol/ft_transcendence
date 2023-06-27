import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io} from 'socket.io-client';
import { GameData} from '../models/game.models';
import { Subject, BehaviorSubject, Observable, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly API_ENDPOINT = 'http://localhost:3000/game'
  socket: any;
  payload$: BehaviorSubject<GameData> = new BehaviorSubject<GameData>(new GameData())
  constructor(private http: HttpClient) {}

  enterQueue(pseudo: string) {
    return this.http.post<any>(this.API_ENDPOINT + "/" + pseudo, {});
  }

  exitQueue(pseudo: string) {
    return this.http.delete<any>(this.API_ENDPOINT + "/" + pseudo);
  }

  // Returns the player's match UUID if one is started or undefined
  refreshQueue(pseudo: string): Observable<string> {
    return this.http.get<any>(this.API_ENDPOINT + "/" + pseudo).pipe(
      map(data => data.matchUUID)
    );
  }

  connectToSocket(pseudo: string) {
    this.socket = io(this.API_ENDPOINT, {
      query: {
        pseudo: pseudo
      }
    })
  }

  connectToRoom(room: string) {
    this.socket.emit('updatePlayers', room);
    this.socket.on('updatePlayers',room, (payload: any) => {
      console.log(payload);
    });
  }

  getGameUpdate = (room: string) => {
    // this.socket.emit('updatePlayers', room);
    // return this.socket.on('updatePlayers');
    this.socket.on('updatePlayers', (payload: GameData) => {
      this.payload$.next(payload);
    })
    return this.payload$.asObservable();
  }

  // connectToSocket() {
  //   this.socket = io(this.API_ENDPOINT + "/inprogress");
  //   this.socket.on('joinGameRoom', (gamedata: any) => {
  //     console.log("ici")
  //   });
  // }

  // joinGameRoom(payload: any) {
  //   this.socket.emit('joinGameRoom', payload);
  // }



  // sendPlayerInfo(payload: any) {
  //   this.socket.emit('keydown', payload);
  // }

  getUser() {
    return this.http.get<any>('http://localhost:3000/auth/user', {withCredentials: true});
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
