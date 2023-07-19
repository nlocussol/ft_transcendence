import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HomeService } from './home/service/home.service';
import { Emitters } from './emitters/emitters';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  authenticated: boolean = false;
  login!: string;
  constructor(private homeService: HomeService) {}

  // @HostListener('window:beforeunload', ['$event'])
  // closeSite() {
  //   this.socket = io(environment.SOCKET_ENDPOINT);
  //   this.homeService.getUser().subscribe(res => this.login = res.login)
  //   this.socket.emit('user-change-status', {login: this.login, status: 'OFFLINE'})
  // }

  ngOnInit(): void {
    // this.homeService.getUser().subscribe({
    //   next: (res) => {
    //     this.login = res.login;
    //     Emitters.authEmitter.emit(true);
    //   },
    //   error: () => {
    //     Emitters.authEmitter.emit(false);
    //   },
    // });
  }


}
