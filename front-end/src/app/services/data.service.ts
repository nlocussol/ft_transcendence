import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  login!: string;
  constructor() {}

  setLogin(login: string) {
    console.log(login);
    this.login = login;
  }

  getLogin(): string {
    console.log('GETLOGIN:', this.login);
    return this.login;
  }
}
