import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Router } from '@angular/router';
import { Message, UserData, Friend } from '../chat-room/interfaces/interfaces';
import { HomeService } from '../home/service/home.service';
import { ProfileService } from '../profile/profile.service';
import { MessageService } from './message.service';
import { DataService } from '../services/data.service';

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
  blockedYou: boolean = false;
  privateGameInvit: boolean = false;

  ngOnInit(): void {
    this.homeService.getUser().subscribe(res => {
      this.login = res.login;
      this.pseudo = res.pseudo
      this.getUserData();
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.receiveSocket()
      this.deletedFriend()
      this.statusChanged()
    })
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
  }

  constructor(private homeService: HomeService, private router: Router, private profileService: ProfileService, private messageService: MessageService,
    private dataService: DataService) {}

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
  
  receiveSocket() {
    this.socket.on('receive-pm', (data: Message) => {
      this.profileService.getProfileData(data.sender).subscribe((senderData: UserData) => {
        data.sender = senderData.pseudo;
        this.conversation.push(data)
      })
    })

    this.socket.on('friend-blocked', (data: any) => {
      if (this.selectedFriend && this.selectedFriend.name === data.friend)
        this.selectedFriend.blocked = data.block
      else if (data.friend === this.login)
        this.blockedYou = data.block
    })
  }

  unblockFriend() {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      block: false
    }
    this.socket.emit('block-friend', body)
    let bodyNotif = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: `${this.login} unblocked you!`,
      type: "BLOCK"
    }
    this.socket.emit('send-notif', bodyNotif);
    bodyNotif.friend = this.login
    bodyNotif.content = `You unblocked ${this.selectedFriend?.name}`
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
    this.dataService.setPrivateGameInvit(true);
    this.socket.emit('send-notif', bodyInviteMatch);
    this.router.navigate(['/game']);
  }

  blockFriend() {
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      block: true
    }
    this.socket.emit('block-friend', body)
    let bodyNotif = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: `${this.pseudo} blocked you!`,
      type: "BLOCK"
    }
    this.socket.emit('send-notif', bodyNotif);
    if (this.selectedFriend) {
      this.profileService.getProfileData(this.selectedFriend.name).subscribe((friendData: UserData) => {
        bodyNotif.friend = this.login
        bodyNotif.content = `You blocked ${friendData.pseudo}`
        this.socket.emit('send-notif', bodyNotif);
        this.friends.find(friend =>  {
          if (friend === this.selectedFriend)
            friend.blocked = true
        })
      })
    }
  }

  getUserData() {
    this.profileService.getProfileData(this.login).subscribe((userData: UserData) => {
      this.userData = userData
      this.friends = userData.friends
      for (let i in this.friends) {
        this.profileService.getProfileData(this.friends[i].name).subscribe((friendData: UserData) => {
          this.friends[i].pseudo = friendData.pseudo;
          this.friends[i].status = friendData.status;
          this.profileService.getProfilePic(this.friends[i].name).subscribe((ppData: Blob) => {
            this.friends[i].pp = URL.createObjectURL(ppData);
            this.friends[i].ppload = true;
          });
        })
      }
    })
  }

  onClickFriend(friend: Friend){
    if (this.selectedFriend)
      this.socket.emit('leave-pm', {login: this.login, friend: friend.pseudo})
    this.profileService.getProfileData(friend.name).subscribe((friendData: UserData) => {
      const userIndex = friendData.friends.findIndex(friend => friend.name === this.login)
      if (userIndex >= 0)
        this.blockedYou = friendData.friends[userIndex].blocked
    })
    this.selectedFriend = friend;
    const body = {
      login: this.login,
      friend: this.selectedFriend?.name,
      content: '',
      sender: ''
    }    
    this.messageService.getMp(body).subscribe((conversationTmp: Message[]) => {
      for (let i in conversationTmp)
        this.profileService.getProfileData(conversationTmp[i].sender).subscribe((senderData: UserData) => conversationTmp[i].sender = senderData.pseudo)
      this.conversation = conversationTmp;
    })
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
