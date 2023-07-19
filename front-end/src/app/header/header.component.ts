import { Component, OnDestroy, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';
import { Socket} from 'socket.io-client';
import { HomeService } from '../home/service/home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  authenticated: boolean = false;
  socket!: Socket;
  notif!: boolean;
  login!: string;

  constructor(
    private headerService: HeaderService,
    private homeService: HomeService,
    private router: Router
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

  ngOnDestroy(): void {
    this.headerService.disconnectFromStatusWS()
  }

  logout() {
    this.headerService.logout().subscribe((res) => {
      this.authenticated = false;
      this.router.navigate(['/auth'])
    });
  }
}
