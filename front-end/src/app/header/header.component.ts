import { Component, OnDestroy, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Notif, UserData } from '../chat-room/interfaces/interfaces';
import { DataService } from '../services/data.service';
import { HttpClient } from '@angular/common/http';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  authenticated: boolean = false;
  socket: Socket;
  notif!: boolean;
  login!: string;

  constructor(
    private headerService: HeaderService,
    private dataService: DataService,
    private http: HttpClient,
    private homeService: HomeService,
  ) {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }

  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
  }

  logout() {
    this.homeService.getUser().subscribe((res: any) => {
      this.socket.emit('user-change-status', {login: res.login, status: 'OFFLINE'})
    })
    this.headerService.logout().subscribe(() => {
      this.authenticated = false;
    });
  }
}
