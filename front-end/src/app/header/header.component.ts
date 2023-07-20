import { Component, OnDestroy, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

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
  pingStatusInterval: any;

  constructor(
    private headerService: HeaderService,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
      if (auth) {
        this.login = this.dataService.getUserLogin();
        this.statusPing();
      }
    });
  }

  statusPing() {
    setInterval(() => {
      this.login = this.dataService.getUserLogin();
      this.headerService.pingApi(this.login).subscribe();
    }, 500);
  }

  ngOnDestroy(): void {
    clearInterval(this.pingStatusInterval);
  }

  logout() {
    clearInterval(this.pingStatusInterval);
    this.headerService.logout().subscribe((res) => {
      this.login = '';
      this.dataService.setUserLogin(this.login);
      this.authenticated = false;
      this.router.navigate(['/auth']);
    });
  }
}
