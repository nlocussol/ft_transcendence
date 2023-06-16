import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  template: `{{message}}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  pseudo: string;
  login: string;
  subscription!: Subscription;

  // constructor(private user: AuthService, private http: HttpClient) {
  constructor(private http: HttpClient,
    private dataService: DataService) {
    this.pseudo = ""
    this.login = ""
  }

  ngOnInit(): void {
    this.subscription = this.dataService.currentMessage.subscribe(message => this.login = message)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  handleFriendSubmit() {
    console.log(this.pseudo);
    console.log(this.login);   
  }
}
