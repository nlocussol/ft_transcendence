import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const body = {
      friend: this.pseudo,
      pseudo: this.login
    }
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/add-friend/", body, { headers }).subscribe()
  }
}
