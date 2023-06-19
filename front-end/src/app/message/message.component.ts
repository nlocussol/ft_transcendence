import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  login: string;
  friends!: any;
  selectedFriend: any;
  userData: any;
  conversation: any;
  newMessage: string = '';

  async getUserData() {
    const res: any = await this.http.get(`http://localhost:3000/db-writer/${this.login}`).toPromise()
    this.userData = res;
    this.friends = res?.friends;
  }

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return
    this.getUserData();
  }
  
  async onClickFriend(friend: any){
    this.selectedFriend = friend;
    const body = {
      pseudo: this.login,
      friend: this.selectedFriend.name,
      msg: '',
      sender: ''
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.conversation = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise()
  }

  async sendMessage(message: string) {
    console.log(message);
    const body = {
      pseudo: this.login,
      friend: this.selectedFriend.name,
      msg: message,
      sender: this.login
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    await this.http.post("http://localhost:3000/db-writer/add-pm/", body, { headers }).toPromise()
    this.conversation = await this.http.post('http://localhost:3000/db-writer/get-pm/', body, { headers }).toPromise()
    this.newMessage = '';
  }
}
