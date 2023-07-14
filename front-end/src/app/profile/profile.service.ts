import { io } from 'socket.io-client';
import { Injectable, OnInit } from '@angular/core';
import { HomeService } from '../home/service/home.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService implements OnInit {
  private readonly API_ENDPOINT_GAME = 'http://localhost:3000/game';
  socket: any;
  login!: string;

  constructor(private homeService: HomeService, private http: HttpClient) {}

  ngOnInit(): void {
    this.homeService.getUser().subscribe((res) => {
      this.login = res.login;
    });
  }

  sendPrivateGameData(gameData: any) {
    return this.http.post('http://localhost:3000/game/private-game', gameData);
  }

  // sendPrivateGameData(gameData: any) {
  //   console.log(gameData);
  //   this.socket = io(this.API_ENDPOINT_GAME, {
  //     auth: {
  //       login: this.login,
  //       privateGameData: true,
  //     },
  //   });
  //   this.socket.emit('privateGame', gameData);
  //   this.socket.disconnect();
  // }
}
