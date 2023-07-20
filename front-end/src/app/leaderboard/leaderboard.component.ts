import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { User } from './interfaces/interfaces';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent {
  topUser: User[];

  constructor(private http: HttpClient) {
    this.topUser = [];
  }

  async ngOnInit() {
    //initial on ng init
    this.http
      .get(`http://localhost:3000/db-writer/leaderboard/`)
      .subscribe((ntm: any) => this.topUser = ntm)
  }
}
