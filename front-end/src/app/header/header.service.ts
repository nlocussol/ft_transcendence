import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {

  constructor(private http: HttpClient) {}

  // Call logout from API to erase jwt cookie
  logout() {
    return this.http.post('http://localhost:3000/auth/logout', {})
  }

  pingApi(login: string) {
    return this.http.get<any>(`http://localhost:3000/ping/${login}`);
  }
}
