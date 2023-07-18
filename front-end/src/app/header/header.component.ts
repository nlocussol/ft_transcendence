import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
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
    private homeService: HomeService,
  ) {
    this.socket = io(environment.SOCKET_ENDPOINT);
  }

  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
    });
    this.homeService.getUser().subscribe((res) => {this.login = res.login})
  }

  ngOnDestroy(): void {
    this.socket.emit('user-change-status', {login: this.login, status: 'OFFLINE'})
    this.socket.disconnect()
  }

  logout() {
    this.socket.emit('user-change-status', {login: this.login, status: 'OFFLINE'})
    this.headerService.logout().subscribe(() => {
      this.authenticated = false;
    });
  }
}
