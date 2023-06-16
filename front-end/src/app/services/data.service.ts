import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private messageSource = new BehaviorSubject('nologin')
  currentMessage  = this.messageSource.asObservable();
  constructor() { }

  changeMessage(message:string) {
    this.messageSource.next(message);
  }
}
