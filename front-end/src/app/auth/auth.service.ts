import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  getTokenValidation() {
    return this.http.get<any>('http://localhost:3000/auth/user').pipe(
      map((data) => {
        return data;
      }),
      catchError((err) => of(false))
    );
  }

  retrieveAccessToken(code: string) {
    return this.http.get<any>('http://localhost:3000/auth/42', {params: {
      code: code
    }});
  }

  retrieveUserData(access_token: string) {
    return this.http.get<any>('http://api.intra.42.fr/v2/me', {headers: {
      Authorization: `Bearer ${access_token}`,
    }})
  }

}
