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

  // enterQueue(login: string) {
  //   return this.http.post<any>(this.API_ENDPOINT + "/" + login, {});
  // }

  // exitQueue(login: string) {
  //   return this.http.delete<any>(this.API_ENDPOINT + "/" + login);
  // }

  // // Returns the player's match UUID if one is started or undefined
  // refreshQueue(login: string): Observable<string> {
  //   return this.http.get<any>(this.API_ENDPOINT + "/" + login).pipe(
  //     map(data => data.matchUUID)
  //   );
  // }

  connectToSocket(login: string) {
    this.socket = io(this.API_ENDPOINT, {
      query: {
        login: login
      }
    })
  }

  enterQueue() {
    this.socket.emit('queue');
  }

  // connectToRoom(room: string) {
  //   this.socket.emit('updatePlayers', room);
  //   this.socket.on('updatePlayers',room, (payload: any) => {
  //     console.log(payload);
  //   });
  // }

  connectToGameUpdate = (room: string) => {
    this.socket.on('updatePlayers', (payload: GameData) => {
      this.payload$.next(payload);
    })
    return this.payload$.asObservable();
  }

  sendPlayerData(payload: any) {
    this.socket.emit('updatePlayers', payload);
  }

  // disconnectFromSocket(matchUUID: string) {
  //   this.socket.emit('gameOver', matchUUID);
  //   // this.socket.disconnect();
  // }

  getUser() {
    return this.http.get<any>('http://localhost:3000/auth/user');
  }
}
