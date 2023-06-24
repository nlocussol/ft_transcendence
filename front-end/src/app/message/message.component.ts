import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private dataServices : DataService, private router: Router) {
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

  blockFriend() {
    const body = {
      pseudo: this.pseudo,
      friend: this.selectedFriend.name,
      block: true
    }
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer/block-friend/', body, { headers }).subscribe()
    this.friends.splice(this.friends.find((friend:any) => friend === this.selectedFriend), 1)
    
    let bodyNotif = {
      pseudo: this.pseudo,
      friend: this.selectedFriend.name,
      content: `${this.pseudo} as blocked you!`,
      type: "BLOCK"
    }
    this.socket.emit('send-notif', bodyNotif);
    bodyNotif.friend = this.pseudo
    bodyNotif.content = `You blocked ${this.selectedFriend.name}`
    this.socket.emit('send-notif', bodyNotif);
    this.selectedFriend = null;
  }

  async getUserData() {
    let res: any = await this.http.get(`http://localhost:3000/db-writer/data/${this.pseudo}`).toPromise()
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
    this.conversation.push(body);
    this.socket.emit('add-pm', body);
    this.newMessage = '';
  }

  friendProfilePage(friend: any) {
    this.router.navigateByUrl(`/user-page/${friend.name}`);
  }
}
