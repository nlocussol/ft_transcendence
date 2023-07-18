import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  privateGameInvit: boolean = false;
  constructor() {}

  setPrivateGameInvit(privateGameInvit: boolean) {
    this.privateGameInvit = privateGameInvit;
  }

  getPrivateGameInvit(): boolean {
    return this.privateGameInvit;
  }
}
