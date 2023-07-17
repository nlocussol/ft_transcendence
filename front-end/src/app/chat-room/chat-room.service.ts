import { Injectable, OnInit } from '@angular/core';
import { HomeService } from '../home/service/home.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Passwords, Room } from './interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  basicHeaders = { headers: new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`) }

  constructor(private http: HttpClient) { }

  getRoomData(room: string) {
    return this.http.get<Room>(`http://localhost:3000/db-writer-room/data-room/${room}`)
  }

  changeRoomStatus(body: any) {
    return this.http.post('http://localhost:3000/db-writer-room/change-status/', body, this.basicHeaders)
  }
    
  getAllRoom(login: string | null) {
    if (login)
      return this.http.get<Room[]>(`http://localhost:3000/db-writer-room/all-room/${login}`)
    return this.http.get<Room[]>(`http://localhost:3000/db-writer-room/all-room/`)
  }

  searchRoom(strToSearch: string) {
    return this.http.get<Room[]>(`http://localhost:3000/db-writer-room/search-room/${strToSearch}`)
  }

  checkRoomPass(body: Passwords) {
    return this.http.post('http://localhost:3000/db-writer-room/check-password/', body, this.basicHeaders)
  }
}
