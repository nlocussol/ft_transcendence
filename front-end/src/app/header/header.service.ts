import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  socket!: Socket;

  constructor(private http: HttpClient) {}

  // Call logout from API to erase jwt cookie
  logout() {
    // this.disconnectFromStatusWS(); //?????
    return this.http.post('http://localhost:3000/auth/logout', {})
  }

  connectToStatusWS(login: string) {
    this.socket = io('http://localhost:3000', {
      auth: {
        login: login,
        from: 'header',
      },
    });
  }

  disconnectFromStatusWS() {
    this.socket.disconnect();
  }
}
