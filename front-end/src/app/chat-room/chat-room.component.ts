import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent {
  friendsToInvite!: any;
  friendInviteRoom!: string;
  selectedStatus!: string;
  selectedOption!: string;
  options!: string[];
  pseudo: string;
  userStatus!: string;
  roomStatus: string;
  rooms: any;
  roomName!: string;
  roomPassword!: string;
  selectedRoom: any;
  selectedRoomPwd!: string;
  newPwd!: string;
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
    this.onCheckboxChange()
    this.getNewRoom();
    this.receiveMessage();
  }


  getNewRoom() {
      this.socket.on('all-room', (data:any) => {
        if (this.selectedRoom || data.owner === this.pseudo)
          this.rooms.push(data)
        })
  }

  newRoomPwd() {
    console.log(this.newPwd);
    const body = {
      name: this.selectedRoom.name,
      status: this.selectedStatus,
      pwd: this.newPwd,
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer-room/change-status/', body, { headers }).subscribe()
    this.selectedStatus = '';
    this.newPwd = '';
  }

  submitRoom() {
    if (!this.roomName)
      return ;
    let roomStatus = "PUBLIC"
    if (this.roomPassword && this.roomPassword !== "")
      roomStatus = "PROTECTED"
    const body = {
      name: this.roomName,
      owner: this.pseudo,
      // pwd: bcrypt.hashSync(this.roomPassword, "Bonjour"),
      pwd: this.roomPassword,
      status: roomStatus
    }
    this.socket.emit('create-room', body);
  }

  sendInviteRoom(userToAddRoom: string) {
    const body = {
      name: this.selectedRoom.name,
      friend: userToAddRoom,
      content: `${this.pseudo} has invited you to join the ${this.selectedRoom.name} room!`,
      type: "ROOM_INVITE"
    }
    this.socket.emit('send-notif', body);
  }

  async onClickRoom(room: any) {
    this.newPwd = '';
    this.selectedStatus = '';
    this.options = ['PUBLIC', 'PROTECTED', 'PRIVATE'];
    this.joined = false;
    const roomData: any = await this.http.get(`http://localhost:3000/db-writer-room/data-room/${room.name}`).toPromise()
    this.friendsToInvite = await this.http.get(`http://localhost:3000/db-writer/friends/${this.pseudo}`).toPromise()
    this.selectedRoom = room;
    this.roomStatus = this.selectedRoom.status;
    this.options.splice(this.options.findIndex(opt => opt === this.roomStatus), 1)
    if (roomData.members && roomData.members.find((member: any) => this.pseudo === member.pseudo)) {
      this.joined = true;
      this.roomStatus = "PUBLIC"
      this.userStatus = roomData.members.find((member: any) => this.pseudo === member.pseudo).status
    }
    this.conversation = this.selectedRoom.messages;
    console.log(this.friendsToInvite);
  }

  onStatusSelected(event: Event) {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.selectedRoom.status = this.selectedStatus;
    console.log(this.selectedStatus);
    if (this.selectedStatus === 'PROTECTED')
      return ;
    const body = {
      name: this.selectedRoom.name,
      status: this.selectedStatus,
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer-room/change-status/', body, { headers }).subscribe()
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
    this.selectedRoom = null;
    if (this.allRoomChecked)
      this.rooms = await this.http.get('http://localhost:3000/db-writer-room/all-room/').toPromise();
    else
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/all-room/${this.pseudo}`).toPromise();
  }

  async findRoom(roomName: string) {
    this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/search-room/${roomName}`).toPromise();
  }

  verifyRoomPwd() {
    if (this.selectedRoom.pwd === this.selectedRoomPwd)
      this.roomStatus = 'PUBLIC'
    this.selectedRoomPwd = ''
  }
}
