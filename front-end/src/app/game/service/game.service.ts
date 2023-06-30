import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { GameData } from '../models/game.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly API_ENDPOINT = 'http://localhost:3000/game';
  socket: any;
  payload$: BehaviorSubject<GameData> = new BehaviorSubject<GameData>(
    new GameData()
  );
  constructor(private http: HttpClient) {}

  connectToSocket(login: string) {
    console.log("Connecting to socket...", login)
    this.socket = io(this.API_ENDPOINT, {
      auth: {
        login: login
      },
      query: {
        login: "grosfdp"
      }
    });
  }

  disconnectFromSocket() {
    this.socket.disconnect();
  }

  enterQueue() {
    this.socket.emit('queue');
  }

  leaveQueue() {
    this.socket.emit('leaveQueue');
  }

  connectToGameUpdate = (room: string) => {
    this.socket.on('updatePlayers', (payload: GameData) => {
      this.payload$.next(payload);
    });
    return this.payload$.asObservable();
  };

  sendPlayerData(payload: any) {
    this.socket.emit('updatePlayers', payload);
  }

  exitRoom() {
    this.socket.emit('leaveRoom');
  }

  getUser() {
    return this.http.get<any>('http://localhost:3000/auth/user');
  }
}
