import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { environment } from 'src/environment';
import { Socket, io } from 'socket.io-client';
import { Friend, UserData } from '../chat-room/interfaces/interfaces';
import { Notif, addFriend } from './interfaces/interfaces';
import { HomeService } from '../home/service/home.service';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  template: `{{ message }}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  pathToPp!: string //= 'http://localhost:3000/upload' // a modif
  doubleAuth!: boolean;
  selectedFile!: File;
  newPseudo!: string;
  pseudoFriend!: string;
  profileData!: UserData;
  pseudo!: string;
  login!: string;
  ppUrl!: any;
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
    private homeService: HomeService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);
    this.http.post('http://localhost:3000/db-writer/upload', formData).subscribe((res: any) => {
      this.http.post('http://localhost:3000/db-writer/change-user-pp', {login: this.login, newPp: res.name}).subscribe(() => {
        this.http.get(`http://localhost:3000/db-writer/user-pp/${this.login}`, { responseType: 'blob' }).subscribe((ppData: Blob) => {
          this.ppUrl = URL.createObjectURL(ppData);
        });
      })
    })
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
      currentLogin: this.login,
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
        console.log(bodyToSend);
        this.http
          .post(
            'http://localhost:3000/db-writer/add-friend/',
            bodyToSend,
            { headers }
          )
          .subscribe();
        break;
      case 'REQUEST_MATCH':
        bodyToSend = {
          uuid: crypto.randomUUID(),
          player1: this.login,
          player2: body.login,
        };
        this.profileService.sendPrivateGameData(bodyToSend).subscribe(() => {
          this.router.navigate(['/game']);
        });
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
    const headers = new HttpHeaders().set('Accept', 'image/jpeg');
    this.notifs = this.profileData.notif;
    this.status = this.profileData.status;
    this.doubleAuth = this.profileData.doubleAuth;
    this.pseudo = this.profileData.pseudo;
    this.http.get(`http://localhost:3000/db-writer/user-pp/${this.login}`, { responseType: 'blob', headers }).subscribe((blob: Blob) => {
      this.ppUrl = URL.createObjectURL(blob);
    });
  }

  newNotif() {
    this.socket.on('receive-notif', (data: Notif) => {
      if (data.friend === this.pseudo || (data.friend === this.login && data.type != 'REQUEST_MATCH')) {
        if (!this.notifs) this.notifs = [];
        if (data.login) this.notifs.push(data);
      }
    });
  }

  handleFriendSubmit() {
    this.getProfileData()
    const body = {
      friend: this.pseudoFriend,
      login: this.login,
      content: `${this.pseudo} want to be your friend!`,
      type: 'REQUEST_FRIEND',
    };
    if (
      this.profileData.friends.find(
        (friend: Friend) => friend.name === this.pseudoFriend
      )
    ) {
      console.log(body.friend, 'is already your friend!');
      return;
    } else if (this.pseudoFriend === this.pseudo) {
      console.log('You can not send friend request to yourself');
      return;
    }
    this.socket.emit('send-notif', body);
    this.pseudoFriend = '';
  }
}
