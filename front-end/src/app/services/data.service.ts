import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  pseudo!: string;
  constructor() {}

  setLogin(pseudo: string) {
    this.pseudo = pseudo;
  }

  getLogin(): string {
    return this.pseudo;
  }
}
