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
  canAccess: boolean;
  rooms: any;
  roomName!: string;
  roomPassword!: string;
  selectedRoom: any;
  selectedRoomPwd!: string;
  conversation: any;
  newMessage!: string;
  roomSearch!: string;
  allRoomChecked: boolean;
  socket: Socket;

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.allRoomChecked = false
    this.canAccess = false
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return;
    this.getAllRoom();
    this.getNewRoom();
    this.receiveMessage();
  }

  getNewRoom() {
    this.socket.on('all-room', (data:any) => this.rooms.push(data))
  }

  submitRoom() {
    if (!this.roomName)
      return ;
    let roomStatus = "PUBLIC"
    if (this.roomPassword || this.roomPassword === "")
      roomStatus = "PROTECTED"
    const body = {
      name: this.roomName,
      owner: this.login,
      pwd: this.roomPassword,
      status: roomStatus
    }
    this.socket.emit('create-room', body);
  }

  async onClickRoom(room: any){
    this.canAccess = false;
    if (room.status === "PUBLIC")
      this.canAccess = true;
    this.selectedRoom = room;
    this.conversation = this.selectedRoom.messages;
  }

  receiveMessage() {
    this.socket.on('receive-room-msg', (data:any) => this.conversation.push(data))
  }

  async sendMessage(message: string) {
    const body = {
      sender: this.login,
      name: this.selectedRoom.name,
      content: message,
    }  
    this.socket.emit('add-room-msg', body);
    this.newMessage = '';
  }

  async onCheckboxChange() {
    console.log(this.allRoomChecked);
    if (this.allRoomChecked)
      this.rooms = await this.http.get('http://localhost:3000/db-writer-room/all-room/').toPromise();
      // else
     //request just my room
  }

  async getAllRoom() {
    if (this.allRoomChecked)
      this.rooms = await this.http.get('http://localhost:3000/db-writer-room/all-room/').toPromise();
    // else
     //request just my room
    console.log(this.rooms);
    
  }

  async findRoom(roomName: string) {
    if (this.allRoomChecked)
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/search-room/${roomName}`).toPromise();
    // else
     //just find in my room
  }

  verifyRoomPwd() {
    if (this.selectedRoom.pwd === this.selectedRoomPwd)
      this.canAccess = true;
  }
}
