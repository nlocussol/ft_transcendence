import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from './environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PongDataFront} from '../pong.models';

@Injectable({
  providedIn: 'root'
})
export class PongService {
  socket: any;
  constructor(private http: HttpClient) {}

  enterQueue(playerUUID: string) {
    console.log("angular:" + playerUUID);
    return this.http.post<any>(environment.API_ENDPOINT, { UUID: playerUUID });
  }

  exitQueue(playerUUID: string) {
    const headers = { 'Player-To-Remove': `${playerUUID}` };
    return this.http.delete<any>(environment.API_ENDPOINT, { headers });
  }

  refreshQueue(playerUUID: string): Observable<PongDataFront> {
    const headers = { 'PlayerUUID': `${playerUUID}` }
    return this.http.get<PongDataFront>(environment.API_ENDPOINT, { headers });
  }

  setupSocketConnection() {
    this.socket = io(environment.API_ENDPOINT)
  }

  emitData(gameUUID: string) {
    this.socket.emit(gameUUID, "test");
  }
}
