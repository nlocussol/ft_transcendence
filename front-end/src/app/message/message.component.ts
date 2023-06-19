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
  message: string = '';

  async getUserData() {
    const res: any = await this.http.get(`http://localhost:3000/db-writer/${this.login}`).toPromise()
    this.friends = res?.friends;
  }

  constructor(private http: HttpClient, private dataServices : DataService) {
    this.login = this.dataServices.getLogin();
    if (!this.login)
      return
    this.getUserData();
  }
  
  onClickFriend(friend: any){
    this.selectedFriend = friend;
  }

  sendMessage(message: string) {
    console.log(message);
    this.message = '';
  }
}
