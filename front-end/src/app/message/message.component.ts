import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Router } from '@angular/router';
import { Message, UserData, Friend } from '../chat-room/interfaces/interfaces';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  login: string;
  friends!: Friend[];
  selectedFriend!: Friend | null;
  userData!: UserData;
  conversation!: Message[];
  newMessage: string = '';
  socket: Socket;
  newMessageObj!: Message;

  constructor(private http: HttpClient, private dataServices : DataService, private router: Router) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return
    this.getUserData();
    this.receiveMessage()
  }

  receiveMessage() {
    this.socket.on('receive-pm', (data: Message) => this.conversation.push(data))
  }

  blockFriend() {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      block: true
    }
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer/block-friend/', body, { headers }).subscribe()
    this.friends.splice(this.friends.findIndex((friend: Friend) => friend === this.selectedFriend), 1)
    
    let bodyNotif = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: `${this.login} blocked you!`,
      type: "BLOCK"
    }
    this.socket.emit('send-notif', bodyNotif);
    bodyNotif.friend = this.login
    bodyNotif.content = `You blocked ${this.selectedFriend?.name}`
    this.socket.emit('send-notif', bodyNotif);
    this.selectedFriend = null;
  }

  async getUserData() {
    this.userData = await this.http.get(`http://localhost:3000/db-writer/data/${this.login}`).toPromise() as UserData
    this.friends = await this.http.get(`http://localhost:3000/db-writer/friends/${this.login}`).toPromise() as Friend[]
    // console.log(this.friends);
  }

  async onClickFriend(friend: Friend){
    this.selectedFriend = friend;
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: '',
      sender: ''
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.conversation = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise() as Message[]
  }

  async sendMessage(message: string) {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: message,
      sender: this.login
    }
    // this.conversation.push(body);
    this.socket.emit('add-pm', body);
    this.newMessage = '';
  }

  friendProfilePage(friend: Friend) {
    this.router.navigateByUrl(`/user-page/${friend.name}`);
  }
}
