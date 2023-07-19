import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';
import { Socket} from 'socket.io-client';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  authenticated: boolean = false;
  socket!: Socket;
  notif!: boolean;
  login!: string;

  constructor(
    private headerService: HeaderService,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
    });
    this.homeService.getUser().subscribe((res) => {
      this.login = res.login;
      this.headerService.connectToStatusWS(this.login as string);
    });
  }

  logout() {
    // this.socket.emit('user-change-status', {login: this.login, status: 'OFFLINE'})
    this.headerService.logout().subscribe(() => {
      this.authenticated = false;
    });
  }
}
