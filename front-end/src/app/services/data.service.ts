import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  privateGameInvit: boolean = false;
  userLogin: string = '';
  constructor() {}

  setPrivateGameInvit(privateGameInvit: boolean) {
    this.privateGameInvit = privateGameInvit;
  }

  getPrivateGameInvit(): boolean {
    return this.privateGameInvit;
  }

  setUserLogin(login: string) {
    this.userLogin = login;
  }

  getUserLogin() {
    return this.userLogin;
  }
}
