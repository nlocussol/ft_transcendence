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
      this.deletedFriend()
      this.statusChanged()
    })
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
  }

  constructor(private http: HttpClient, private homeService: HomeService, private router: Router) {}

  deletedFriend() {
    this.socket.on('friend-deleted', data => {
      if (data.login === this.login) {
        const friendIndex = this.friends.findIndex(friend => friend.name === data.friend)
        if (friendIndex >= 0)
          this.friends.splice(friendIndex, 1);
      }
      else if (data.friend === this.login) {
        const friendIndex = this.friends.findIndex(friend => friend.name === data.login)
        if (friendIndex >= 0)
          this.friends.splice(friendIndex, 1);
      }
    })
  }

  statusChanged() {
    this.socket.on('user-status-changed', data => {
        const statusIndex = this.friends.findIndex(friend => friend.name === data.login)
        if (statusIndex >= 0)
          this.friends[statusIndex].status = data.status
    })
  }
  receiveMessage() {
    this.socket.on('receive-pm', async (data: Message) => {
      let senderData: UserData = await this.http.get(`http://localhost:3000/db-writer/data/${data.sender}`).toPromise() as UserData
      data.sender = senderData.pseudo;
      this.conversation.push(data)
    })
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

  deleteFriend() {
    const friendToDelete = {
      login: this.login,
      friend: this.selectedFriend?.name
    }
    this.socket.emit('delete-friend', friendToDelete)
  }

  matchFriend() {
    const bodyInviteMatch = {
      friend: this.selectedFriend?.name,
      login: this.login,
      content: `${this.pseudo} challenges you to a pong duel!`,
      type: 'REQUEST_MATCH'
    }
    this.socket.emit('send-notif', bodyInviteMatch);
    this.router.navigate(['/game']);
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
    for (let i in this.friends) {
      this.http.get(`http://localhost:3000/db-writer/data/${this.friends[i].name}`).subscribe((friendData: UserData | any) => {
        this.friends[i].pseudo = friendData.pseudo;
        this.friends[i].status = friendData.status;
      })
    }
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
    let conversationTmp: Message[] = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise() as Message[]
    for (let i in conversationTmp) {
      const senderData: UserData = await this.http.get(`http://localhost:3000/db-writer/data/${conversationTmp[i].sender}`).toPromise() as UserData
      conversationTmp[i].sender = senderData.pseudo;
    }
    this.conversation = conversationTmp;
    this.socket.emit('join-pm', {login: this.login, friend: friend.name})
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
