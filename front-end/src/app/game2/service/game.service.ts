import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatchData } from 'src/app/interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService2 {
  private readonly API_URL :string = "http://localhost:3000/pong-data"
  constructor(private http: HttpClient) { }

  sendPlayerData(playerData : any): Observable<any> {
    return this.http.post<any>(this.API_URL, JSON.stringify(playerData));
  }

  searchOpponent(playerUUID: string): Observable<any> {
    return this.http.get<any>(this.API_URL + "/" + playerUUID);
  }

}
