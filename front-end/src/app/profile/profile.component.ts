import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { environment } from 'src/environment';
import { Socket, io } from 'socket.io-client';

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
  profileData: any;
  pseudo: string = "! Go Login to get a profile card !";
  ppUrl!: string;
  status!: string;
  socket: Socket;
  notifs!: any[];

  constructor(private http: HttpClient, private dataService: DataService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    const tmp: string = dataService.getLogin();
    if (!tmp)
      return ;
    this.pseudo = tmp;
    console.log('My login:', this.pseudo);
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
      pseudo: this.pseudo,
      newPp: this.selectedFile
    }
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/change-user-pp/", body, { headers }).subscribe()
  }

  change2AF() {
    this.doubleAuth = !this.doubleAuth;
    const body = {
      pseudo: this.pseudo,
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

  acceptRequest(body: any) {
    console.log(body); 
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/add-friend/", body, { headers }).subscribe()
    this.notifs.splice(this.notifs.find(request => body === request), 1);
  }

  refuseRequest(body: any) {
    console.log(body); 
    this.notifs.splice(this.notifs.find(request => body === request), 1);
  }

  async getProfileData() {
    this.profileData = await this.http.get(`http://localhost:3000/db-writer/${this.pseudo}`).toPromise()
    this.ppUrl = this.profileData.pp;
    this.status = this.profileData.status;
    this.doubleAuth = this.profileData.doubleAuth
  }

  newNotif() {
    this.socket.on('receive-notif', (data:any) => {
      if (data.friend === this.pseudo) {
        if (!this.notifs)
          this.notifs = [];
        this.notifs.push(data);
      }
    })
  }

  handleFriendSubmit() {
    const body = {
      friend: this.pseudoFriend,
      pseudo: this.pseudo,
      content: `${this.pseudo} want to be your friend!`,
      type: "REQUEST"
    }
    if (this.profileData.friends.find((friend:any) => friend.name === body.pseudo)) {
      console.log(body.friend, 'is already your friend!');
      return ;
    }
    this.socket.emit('send-notif', body);
  }
}
