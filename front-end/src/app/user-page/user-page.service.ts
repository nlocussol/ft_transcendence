import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserData } from '../chat-room/interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserPageService {

  constructor(private http: HttpClient) {}

  getProfileData(login: string) {
    return this.http.get<UserData>(`http://localhost:3000/db-writer/data/${login}`)
  }
}
