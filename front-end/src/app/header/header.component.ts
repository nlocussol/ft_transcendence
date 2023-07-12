import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Notif, UserData } from '../chat-room/interfaces/interfaces';
import { DataService } from '../services/data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  authenticated: boolean = false;
  socket: Socket;
  notif: boolean;
  login: string;

  constructor(
    private headerService: HeaderService,
    private dataService: DataService,
    private http: HttpClient
  ) {
    this.notif = false;
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.login = dataService.getLogin();
    this.socket.on('receive-notif', (data: Notif) => {
      if (data.friend === this.login) {
        this.http
          .get(`http://localhost:3000/db-writer/data-user/${this.login}`)
          .subscribe((res: any) => {
            if (res.notif.length() > 0) this.notif = true;
            else this.notif = false;
          });
      }
    });
  }

  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth: boolean) => {
      this.authenticated = auth;
    });
  }

  logout() {
    this.headerService.logout().subscribe(() => {
      this.authenticated = false;
    });
  }
}
