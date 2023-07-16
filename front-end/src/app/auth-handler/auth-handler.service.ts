import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthHandlerService {
  private pseudos = ['nlocusso', 'adamiens', 'tgfdp'];

  constructor(private http: HttpClient) {}

  retrieveAccessToken(code: string) {
    return this.http.get('http://localhost:3000/auth/42', {
      responseType: 'text',
      params: {
        code: code,
      },
    });
  }

  getUserData(access_token: string) {
    return this.http.get('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  sendLogin(login: string) {
    return this.http.get(`http://localhost:3000/db-writer/data/${login}`);
  }

  getJwt(login: string) {
    return this.http.post('http://localhost:3000/auth/login', { login: login });
  }

  createUser(body: any) {
    const headers = new HttpHeaders().set(
      'Content-type',
      `application/json; charset=UTF-8`
    );
    return this.http.post('http://localhost:3000/db-writer/create-user', body, {
      headers,
    });
  }

  checkIfPseudoExists(pseudo: string) {
    return this.http.get<{ pseudoAlreadyExists: true }>(
      `http://localhost:3000/db-writer/pseudo/${pseudo}`
    );
  }
}
