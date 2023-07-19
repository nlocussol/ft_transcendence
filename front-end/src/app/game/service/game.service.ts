import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { GameData } from '../models/game.models';
import { BehaviorSubject, EMPTY, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly API_GAME_WEBSOCKET = 'http://localhost:3000/game';
  private readonly API_WEBSOCKET = 'http://localhost:3000';
  socket: any;
  socketUpdateStatus: any;
  payload$: BehaviorSubject<GameData> = new BehaviorSubject<GameData>(
    new GameData()
  );
  constructor(private http: HttpClient) {}

  connectToSocket(login: string, pseudo: string) {
    this.socket = io(this.API_GAME_WEBSOCKET, {
      auth: {
        login: login,
        pseudo: pseudo,
      },
    });
  }

  disconnectFromSocket() {
    this.socket.disconnect();
  }

  enterQueue(payload: any) {
    this.socket.emit('queue', payload);
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

  autoReconnect(login: string) {
    return this.http
      .get(`http://localhost:3000/game/${login}`, {
        responseType: 'text',
      })
      .pipe(catchError((e) => EMPTY));
  }

  connectToStatusWS() {
    this.socketUpdateStatus = io(this.API_WEBSOCKET);
    this.socket.emit('inGame')
  }

  updateMyStatus(login: string, status: string) {
    const toSend = { login: login, status: status };
    this.socketUpdateStatus.emit('user-change-status', toSend);
  }

  disconnectFromStatusWS() {
    this.socketUpdateStatus.disconnect();
  }
}
