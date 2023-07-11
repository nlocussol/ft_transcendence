import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { environment } from 'src/environment';
import { Socket, io } from 'socket.io-client';
import { Friend, UserData } from '../chat-room/interfaces/interfaces';
import { Notif, addFriend } from './interfaces/interfaces';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-profile',
  template: `{{ message }}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  doubleAuth!: boolean;
  selectedFile!: File;
  newPseudo!: string;
  pseudoFriend!: string;
  profileData!: UserData;
  pseudo!: string;
  login!: string;
  ppUrl!: string;
  status!: string;
  socket!: Socket;
  notifs!: Notif[];

  ngOnInit(): void {
    this.homeService.getUser().subscribe((res) => {
      this.login = res.login;
      this.pseudo = res.pseudo;
      this.getProfileData();
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.newNotif();
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  constructor(
    private http: HttpClient,
    private homeService: HomeService
  ) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.ppUrl = event.target.result;
    };
    reader.readAsDataURL(this.selectedFile);
    const body = {
      login: this.login,
      newPp: this.selectedFile,
    };
    const headers = new HttpHeaders().set('Content-type', `application/json`);
    this.http
      .post('http://localhost:3000/db-writer/change-user-pp/', body, {
        headers,
      })
      .subscribe();
  }

  change2AF() {
    this.doubleAuth = !this.doubleAuth;
    const body = {
      login: this.login,
      doubleAuth: this.doubleAuth,
    };
    const headers = new HttpHeaders().set('Content-type', `application/json`);
    this.http
      .post('http://localhost:3000/db-writer/change-2fa/', body, { headers })
      .subscribe();
  }

  async changeUsername() {
    const body = {
      currentPseudo: this.pseudo,
      newPseudo: this.newPseudo,
    };
    const headers = new HttpHeaders().set('Content-type', `application/json`);
    const res = await this.http
      .post('http://localhost:3000/db-writer/change-user-pseudo/', body, {
        headers,
      })
      .toPromise();
    if (res) this.pseudo = this.newPseudo;
  }

  acceptRequest(body: Notif) {
    const bodyToDelete = {
      login: this.login,
      index: this.notifs.findIndex((notif) => notif === body),
    };
    let bodyToSend: any;
    const headers = new HttpHeaders().set('Content-type', `application/json`);
    switch (body.type) {
      case 'REQUEST_FRIEND':
        bodyToSend = {
          login: this.login,
          friend: body.login,
        };
        this.http
          .post(
            'http://localhost:3000/db-writer/add-friend/',
            bodyToSend as addFriend,
            { headers }
          )
          .subscribe();
        break;

      case 'REQUEST_MATCH':
        bodyToSend = {
          uuid: crypto.randomUUID(),
          payer1: this.login,
          player2: bodyToDelete.login,
        };
        const notifBody = {
          friend: body.login,
          login: this.login,
          content: `${this.pseudo} has accepted your match request so go in the game page!`,
          type: 'MATCH_ACCEPTED',
        };
        this.socket.emit('send-notif', notifBody);
        break;

      case 'ROOM_INVITE':
        bodyToSend = {
          name: body.name,
          login: this.login,
          pseudo: this.pseudo,
        };
        this.http
          .post(
            'http://localhost:3000/db-writer-room/add-user-room',
            bodyToSend,
            { headers }
          )
          .subscribe();
        break;
    }
    this.notifs.splice(
      this.notifs.findIndex((request) => body === request),
      1
    );
    this.http
      .post('http://localhost:3000/db-writer/delete-notif/', bodyToDelete, {
        headers,
      })
      .subscribe();
  }

  refuseRequest(body: Notif) {
    const bodyToDelete = {
      login: this.login,
      index: this.notifs.findIndex((notif) => notif === body),
    };
    const headers = new HttpHeaders().set('Content-type', `application/json`);
    this.notifs.splice(
      this.notifs.findIndex((request) => body === request),
      1
    );
    this.http
      .post('http://localhost:3000/db-writer/delete-notif/', bodyToDelete, {
        headers,
      })
      .subscribe();
  }

  async getProfileData() {
    this.profileData = (await this.http
      .get(`http://localhost:3000/db-writer/data/${this.login}`)
      .toPromise()) as UserData;
    this.ppUrl = this.profileData.pp;
    this.notifs = this.profileData.notif;
    this.status = this.profileData.status;
    this.doubleAuth = this.profileData.doubleAuth;
    this.pseudo = this.profileData.pseudo;
  }

  newNotif() {
    this.socket.on('receive-notif', (data: Notif) => {
      if (data.friend === this.login) {
        if (!this.notifs) this.notifs = [];
        if (data.login)
          // this.notifs.push({friend: data.login, content: data.content, type: data.type});
          this.notifs.push(data);
      }
    });
  }

  handleFriendSubmit() {
    const body = {
      friend: this.pseudoFriend,
      login: this.login,
      content: `${this.pseudo} want to be your friend!`,
      type: 'REQUEST_FRIEND',
    };
    if (
      this.profileData.friends.find(
        (friend: Friend) => friend.name === body.login
      )
    ) {
      console.log(body.friend, 'is already your friend!');
      return;
    }
    else if (this.pseudoFriend === this.pseudo){
      console.log('You can not send friend request to yourself');
      return;
    }
    this.socket.emit('send-notif', body);
    this.pseudoFriend = '';
  }
}
