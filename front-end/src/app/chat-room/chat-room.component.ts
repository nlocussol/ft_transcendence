import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent {
  login: string;
  rooms: any;
  roomName!: string;
  roomPassword!: string;
  selectedRoom: any;
  conversation: any;
  newMessage!: string;
  roomSearch!: string;
  socket: Socket;

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return;
    this.getAllRoom();
    this.socket.on('all-room', (data:any) => this.rooms = data)
  }

  submitRoom() {
    if (!this.roomName)
      return ;
    const body = {
      name: this.roomName,
      owner: this.login,
      pwd: this.roomPassword,
      status: "PUBLIC"
    }
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`);
    this.http.post('http://localhost:3000/db-writer-room/create-room/', body, { headers }).subscribe();
  }

  async onClickRoom(room: any){
    this.selectedRoom = room;
    //this.conversation = await this.http.get('http://localhost:3000/db-writer-room/').toPromise() // get message
  }

  receiveMessage() {
    this.socket.on('receive-room-pm', (data:any) => {
      console.log('MESSAGE RECEIVE', data);
      this.conversation.push(data)}
      )
  }

  async sendMessage(message: string) {
    const body = {
      pseudo: this.login,
      room: this.selectedRoom.name,
      content: message,
      sender: this.login
    }  
    this.socket.emit('add-room-pm', body);
    this.newMessage = '';
  }

  async getAllRoom() {
    this.rooms = await this.http.get('http://localhost:3000/db-writer-room/').toPromise();
  }

  async findRoom(roomName: string) {
    // this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/${roomName}`).toPromise();
  }
}
