import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  pseudo!: string;
  login!: string;

  constructor() {}

  setLoginPseudo(pseudo: string, login: string) {
    this.pseudo = pseudo;
    this.login = login;
  }

  getLogin(): string {
    return this.login;
  }

  getPseudo(): string {
    return this.pseudo;
  }
}
