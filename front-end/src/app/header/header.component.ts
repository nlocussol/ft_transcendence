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
    // this.notif = false;
    this.socket = io(environment.SOCKET_ENDPOINT);

    // this.login = dataService.getLogin();
    // this.socket.on('receive-notif', (data: Notif) => {
    //   if (data.friend === this.login) {
    //     this.http
    //       .get(`http://localhost:3000/db-writer/data-user/${this.login}`)
    //       .subscribe((res: any) => {
    //         if (res.notif.length() > 0) this.notif = true;
    //         else this.notif = false;
    //       });
    //   }
    // });
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
