import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  login: string;
  friends!: any;
  selectedFriend: any;
  userData: any;
  conversation: any;
  newMessage: string = '';
  socket: Socket;
  newMessageObj: any;

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return
    this.getUserData();
    this.receiveMessage()
  }

  receiveMessage() {
    this.socket.on('receive-pm', (data:any) => {
      console.log('MESSAGE RECEIVE', data);
      this.conversation.push(data)}
      )
  }

  async getUserData() {
    const res: any = await this.http.get(`http://localhost:3000/db-writer/${this.login}`).toPromise()
    this.userData = res;
    this.friends = res?.friends;
  }

  async onClickFriend(friend: any){
    this.selectedFriend = friend;
    const body = {
      pseudo: this.login,
      friend: this.selectedFriend.name,
      content: '',
      sender: ''
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.conversation = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise()
  }

  async sendMessage(message: string) {
    const body = {
      pseudo: this.login,
      friend: this.selectedFriend.name,
      content: message,
      sender: this.login
    }
    this.socket.emit('add-pm', body);
    this.newMessage = '';
  }
}
