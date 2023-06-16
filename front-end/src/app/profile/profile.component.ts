import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profile',
  template: `{{message}}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent{
  pseudo!: string;
  login: string;

  constructor(private http: HttpClient, private dataService: DataService) {
    this.login = dataService.getLogin();
  }

  handleFriendSubmit() {
    console.log(this.pseudo);
    console.log(this.login);   
  }
}
