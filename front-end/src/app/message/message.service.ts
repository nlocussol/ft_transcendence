import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private socket: Socket) { }

  sendMessage() {
		this.socket.emit('add-pm');
	}
  
  receiveMessage() {
		return this.socket.fromEvent('receive-pm');
	}
}
