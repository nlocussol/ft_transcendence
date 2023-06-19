import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent {
  login: string;
  rooms: any;
  selectedRoom: any;
  conversation: any;
  newMessage!: string;
  roomSearch!: string;

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return;
    this.getAllRoom()
  }

  async onClickRoom(room: any){
    this.selectedRoom = room;
    this.conversation = await this.http.get('http://localhost:3000/db-writer-room/').toPromise() // get message
  }

  async sendMessage(message: string) {
    const body = {
      pseudo: this.login,
      room: this.selectedRoom.name,
      msg: message,
      sender: this.login
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    await this.http.post("http://localhost:3000/db-writer-room/add-pm/", body, { headers }).toPromise() 
    this.conversation = await this.http.get('http://localhost:3000/db-writer-room/').toPromise() // get message
    this.newMessage = '';
  }

  async getAllRoom() {
    this.rooms = await this.http.get('http://localhost:3000/db-writer-room/').toPromise();
  }

  async findRoom(roomName: string) {
    this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/${roomName}`).toPromise();
  }
}
