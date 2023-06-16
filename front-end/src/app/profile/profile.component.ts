import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  pseudo: string
  login: string;

  // constructor(private user: AuthService, private http: HttpClient) {
  constructor(private http: HttpClient) {
    this.pseudo = ""
    this.login = ""
  }

  handleFriendSubmit() {
    console.log(this.pseudo);
    console.log(this.login);   
  }
}
