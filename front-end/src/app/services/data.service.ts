import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  login!: string;
  constructor() {}

  setLogin(login: string) {
    this.login = login;
  }

  getLogin(): string {
    return this.login;
  }
}
