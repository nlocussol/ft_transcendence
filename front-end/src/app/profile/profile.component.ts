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
  profileData: any;
  pseudo: string = "! Go Login to get a profile card !";
  ppUrl!: string;
  status!: string;
  socket: Socket;
  requests!: any[];

  constructor(private http: HttpClient, private dataService: DataService) {
    this.socket = io(environment.SOCKET_ENDPOINT);
    const tmp: string = dataService.getLogin();
    if (!tmp)
      return ;
    this.pseudo = tmp;
    console.log('My login:', this.pseudo);
    this.getProfileData();
    this.newFriendRequest();
  }

  newFriendRequest() {
    this.socket.on('receive-friend-request', (data:any) => {
      if (data.friend === this.pseudo) {
        if (!this.requests)
          this.requests = [];
        this.requests.push(data);
      }
    })
  }

  acceptRequest(body: any) {
    console.log(body); 
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/add-friend/", body, { headers }).subscribe()
    this.requests.splice(this.requests.find(request => body === request), 1);
  }

  refuseRequest(body: any) {
    console.log(body); 
    this.requests.splice(this.requests.find(request => body === request), 1);
  }

  async getProfileData() {
    this.profileData = await this.http.get(`http://localhost:3000/db-writer/${this.pseudo}`).toPromise()
    this.ppUrl = this.profileData.pp;
    this.status = this.profileData.status;
  }

  handleFriendSubmit() {
    const body = {
      friend: this.pseudo,
      pseudo: this.pseudo,
      content: '',
      sender: ''
    }
    if (this.profileData.friends.find((friend:any) => friend.name === body.pseudo)) {
      console.log(body.friend, 'is already your friend!');
      return ;
    }
    this.socket.emit('send-friend-request', body);
  }
}
