import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { environment } from 'src/environment';
import { Socket, io } from 'socket.io-client';
import { Friend, UserData } from '../chat-room/interfaces/interfaces';
import { Notif } from './interfaces/interfaces';

@Component({
  selector: 'app-profile',
  template: `{{message}}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  doubleAuth!: boolean;
  selectedFile!: File;
  newPseudo!: string;
  pseudoFriend!: string;
  profileData!: UserData;
  pseudo: string = "! Go Login to get a profile card !";
  login!: string;
  ppUrl!: string;
  status!: string;
  socket: Socket;
  notifs!: Notif[];

  constructor(private http: HttpClient, private dataService: DataService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    const tmp: string = dataService.getLogin();
    const temp: string = dataService.getPseudo();
    if (!tmp || !temp)
      return ;
    this.pseudo = temp;
    this.login = tmp;
    console.log('My pseudo:', this.pseudo);
    this.getProfileData();
    this.newNotif();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.ppUrl = event.target.result;
    };
    reader.readAsDataURL(this.selectedFile);
    const body = {
      login: this.login,
      newPp: this.selectedFile
    }
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/change-user-pp/", body, { headers }).subscribe()
  }

  change2AF() {
    this.doubleAuth = !this.doubleAuth;
    const body = {
      login: this.login,
      doubleAuth: this.doubleAuth
    }
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/change-2fa/", body, { headers }).subscribe()
  }

  async changeUsername() {
    const body = {
      currentPseudo: this.pseudo,
      newPseudo: this.newPseudo
    }
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    const res = await this.http.post("http://localhost:3000/db-writer/change-user-pseudo/", body, { headers }).toPromise()
    if (res)
      this.pseudo = this.newPseudo;
  }

  acceptRequest(body: Notif) {
    let bodyToSend: any;
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    switch (body.type) {
      case 'REQUEST_FRIEND':
        bodyToSend = {
          login: body.login,
          friend: body.friend,
          content: '',
          sender: ''
        }
        this.http.post("http://localhost:3000/db-writer/add-friend/", bodyToSend, { headers }).subscribe()
        break;

      case 'REQUEST_MATCH':
        
      case 'ROOM_INVITE':
        bodyToSend = {
          name: body.name,
          login: body.friend,
        }
        console.log(bodyToSend);
        this.http.post('http://localhost:3000/db-writer-room/add-user-room', bodyToSend, { headers }).subscribe()
        break;
    }
    this.notifs.splice(this.notifs.findIndex(request => body === request), 1);
  }

  refuseRequest(body: Notif) {
    console.log(body); 
    this.notifs.splice(this.notifs.findIndex(request => body === request), 1);
  }

  async getProfileData() {
    this.profileData = await this.http.get(`http://localhost:3000/db-writer/data/${this.login}`).toPromise() as UserData
    this.ppUrl = this.profileData.pp;
    this.status = this.profileData.status;
    this.doubleAuth = this.profileData.doubleAuth
  }

  newNotif() {
    this.socket.on('receive-notif', (data: Notif) => {
      if (data.friend === this.pseudo) {
        if (!this.notifs)
          this.notifs = [];
        this.notifs.push(data);
      }
    })
  }

  handleFriendSubmit() {
    console.log(this.pseudoFriend);
    console.log(this.login);
    const body = {
      friend: this.pseudoFriend,
      login: this.login,
      content: `${this.pseudo} want to be your friend!`,
      type: "REQUEST_FRIEND"
    }
    if (this.profileData.friends.find((friend: Friend) => friend.name === body.login)) {
      console.log(body.friend, 'is already your friend!');
      return ;
    }
    this.socket.emit('send-notif', body);
  }
}
