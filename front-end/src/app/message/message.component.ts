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
  pseudo: string;
  friends!: any;
  selectedFriend: any;
  userData: any;
  conversation: any;
  newMessage: string = '';
  socket: Socket;
  newMessageObj: any;

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.pseudo = this.dataServices.getLogin();
    if (!this.pseudo)
      return
    this.getUserData();
    this.receiveMessage()
  }

  receiveMessage() {
    this.socket.on('receive-pm', (data:any) => this.conversation.push(data))
  }

  async getUserData() {
    let res: any = await this.http.get(`http://localhost:3000/db-writer/${this.pseudo}`).toPromise()
    this.userData = res;
    res = await this.http.get(`http://localhost:3000/db-writer/friends/${this.pseudo}`).toPromise()
    this.friends = res;
    console.log(this.friends);
  }

  async onClickFriend(friend: any){
    this.selectedFriend = friend;
    const body = {
      pseudo: this.pseudo,
      friend: this.selectedFriend.name,
      content: '',
      sender: ''
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.conversation = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise()
  }

  async sendMessage(message: string) {
    const body = {
      pseudo: this.pseudo,
      friend: this.selectedFriend.name,
      content: message,
      sender: this.pseudo
    }
    this.socket.emit('add-pm', body);
    this.newMessage = '';
  }
}
