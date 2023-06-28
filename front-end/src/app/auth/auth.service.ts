import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  getToken() {
    return this.http.get<any>('http://localhost:3000/auth/user').pipe(
      map(data => {
        return data;
      }),
      catchError(err => of(false))
    );
  }
}
