import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { environment } from 'src/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  socket: any;

  constructor() { }

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }
}
