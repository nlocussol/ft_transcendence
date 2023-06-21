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
  pseudo: string;
  userStatus!: string;
  roomStatus: string;
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
  joined: boolean;

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.joined = false;
    this.allRoomChecked = false;
    this.roomStatus = 'PROTECTED';
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.pseudo = this.dataServices.getLogin();
    if (!this.pseudo)
      return;
    this.getAllRoom();
    this.getNewRoom();
    this.receiveMessage();
  }

  getNewRoom() {
      this.socket.on('all-room', (data:any) => {
        if (this.selectedRoom || data.owner === this.pseudo)
          this.rooms.push(data)}
      )
  }

  submitRoom() {
    if (!this.roomName)
      return ;
    let roomStatus = "PUBLIC"
    if (this.roomPassword || this.roomPassword === "")
      roomStatus = "PROTECTED"
    const body = {
      name: this.roomName,
      owner: this.pseudo,
      pwd: this.roomPassword,
      status: roomStatus
    }
    this.socket.emit('create-room', body);
  }

  async onClickRoom(room: any) {
    this.joined = false;
    const roomData: any = await this.http.get(`http://localhost:3000/db-writer-room/data-room/${room.name}`).toPromise()
    if (roomData.members && roomData.members.find((member: any) => this.pseudo === member.pseudo)) {
      this.joined = true;
      this.userStatus = roomData.members.find((member: any) => this.pseudo === member.pseudo).status
    }
    this.selectedRoom = room;
    this.roomStatus = this.selectedRoom.status
    this.conversation = this.selectedRoom.messages;
  }

  receiveMessage() {
    this.socket.on('receive-room-msg', (data:any) => this.conversation.push(data))
  }

  joinRoom() {
    this.joined = true;
    const body = {
      pseudo: this.pseudo,
      name: this.selectedRoom.name,
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer-room/add-user-room', body, { headers }).subscribe()
  }

  async sendMessage(message: string) {
    const body = {
      sender: this.pseudo,
      name: this.selectedRoom.name,
      content: message,
    }  
    this.socket.emit('add-room-msg', body);
    this.newMessage = '';
  }

  async onCheckboxChange() {
    if (this.allRoomChecked)
      this.rooms = await this.http.get('http://localhost:3000/db-writer-room/all-room/').toPromise();
    else {
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/all-room/${this.pseudo}`).toPromise();
      console.log(this.rooms);
    }
  }

  async getAllRoom() {
    if (this.allRoomChecked)
      this.rooms = await this.http.get('http://localhost:3000/db-writer-room/all-room/').toPromise();
    else {
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/all-room/${this.pseudo}`).toPromise(); 
      console.log(this.rooms);
    }
  }

  async findRoom(roomName: string) {
    if (this.allRoomChecked)
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/search-room/${roomName}`).toPromise();
    // else
     //just find in my room
  }

  verifyRoomPwd() {
    if (this.selectedRoom.pwd === this.selectedRoomPwd)
      this.roomStatus = 'PUBLIC'
    this.selectedRoomPwd = ''
  }
}
