import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../chat-room/interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  basicHeaders = { headers: new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`) }

  constructor(private http: HttpClient) {}

  getMp(body: any) {
    return this.http.post<Message[]>('http://localhost:3000/db-writer/get-pm/', body, this.basicHeaders,)
  }
}
