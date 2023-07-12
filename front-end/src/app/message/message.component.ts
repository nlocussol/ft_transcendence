import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Router } from '@angular/router';
import { Message, UserData, Friend } from '../chat-room/interfaces/interfaces';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, OnDestroy {
  login!: string;
  pseudo!: string;
  friends!: Friend[];
  selectedFriend!: Friend | null;
  userData!: UserData;
  conversation!: Message[];
  newMessage!: string;
  socket!: Socket;
  newMessageObj!: Message;

  ngOnInit(): void {
    this.homeService.getUser().subscribe(res => {
      this.login = res.login;
      this.pseudo = res.pseudo
      this.getUserData();
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.receiveMessage()
    })
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
  }

  constructor(private http: HttpClient, private homeService: HomeService, private router: Router) {}

  receiveMessage() {
    this.socket.on('receive-pm', (data: Message) => this.conversation.push(data))
  }

  async unblockFriend() {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      block: false
    }
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer/block-friend/', body, { headers }).subscribe()  
    let bodyNotif = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: `${this.login} unblocked you!`,
      type: "BLOCK"
    }
    this.socket.emit('send-notif', bodyNotif);
    bodyNotif.friend = this.login
    bodyNotif.content = `You blocked ${this.selectedFriend?.name}`
    this.socket.emit('send-notif', bodyNotif);
    this.friends.find(friend =>  {
      if (friend === this.selectedFriend)
        friend.blocked = false
    })
  }

  async blockFriend() {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      block: true
    }
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer/block-friend/', body, { headers }).subscribe()    
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
    this.friends.find(friend =>  {
      if (friend === this.selectedFriend)
        friend.blocked = true
    })
  }

  async getUserData() {
    this.userData = await this.http.get(`http://localhost:3000/db-writer/data/${this.login}`).toPromise() as UserData
    this.friends = await this.http.get(`http://localhost:3000/db-writer/friends/${this.login}`).toPromise() as Friend[]
  }

  async onClickFriend(friend: Friend){
    if (this.selectedFriend)
      this.socket.emit('leave-pm', {login: this.login, friend: friend.pseudo})
    this.selectedFriend = friend;
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: '',
      sender: ''
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.conversation = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise() as Message[]
    this.socket.emit('join-pm', {login: this.login, friend: friend.pseudo})
  }

  async sendMessage(message: string) {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: message,
      sender: this.login
    }
    this.socket.emit('add-pm', body);
    this.newMessage = '';
  }

  friendProfilePage(friend: Friend) {
    this.router.navigateByUrl(`/user-page/${friend.name}`);
  }
}
