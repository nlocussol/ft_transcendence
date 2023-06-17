import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly API_URL = 'http://localhost:3000/game'
  constructor(private http: HttpClient) { }

  enterQueue(UUID: string) {
    console.log("angular:" + UUID);
    return this.http.post<any>(this.API_URL, { UUID });
  }

  exitQueue(UUID: string) {
    const headers = { 'Player-To-Remove': `${UUID}` };
    console.log(headers)
    return this.http.delete<any>(this.API_URL, { headers });
  }
}
