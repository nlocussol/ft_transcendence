import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthHandlerService {
  basicHeaders = {
    headers: new HttpHeaders().set(
      'Content-type',
      `application/json; charset=UTF-8`
    ),
  };
  constructor(private http: HttpClient) {}

  retrieveAccessToken(code: string) {
    return this.http.get('http://localhost:3000/auth/42', {
      responseType: 'text',
      params: {
        code: code,
      },
    });
  }

  getUserDataFrom42(access_token: string) {
    return this.http.get('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  getUserDataFromDb(login: string) {
    return this.http.get(`http://localhost:3000/db-writer/data/${login}`)
  }

  getJwt(login: string) {
    return this.http.post('http://localhost:3000/auth/login', { login: login });
  }

  createUser(body: any) {
    return this.http.post(
      'http://localhost:3000/db-writer/create-user',
      body,
      this.basicHeaders
    );
  }

  checkIfPseudoExists(pseudo: string) {
    return this.http.get<{ pseudoAlreadyExists: true }>(
      `http://localhost:3000/db-writer/pseudo/${pseudo}`
    );
  }

  sendIntraProfilePicUrl(login: string, link: string) {
    return this.http.post(
      `http://localhost:3000/db-writer/download-pp/${login}`,
      { link },
      { responseType: 'text' }
    );
  }

  getQrCode(login: string) {
    return this.http.get(
      `http://localhost:3000/db-writer/get-qrcode/${login}`,
      { responseType: 'text' }
    );
  }

  verify2fa(body: any) {
    return this.http.post(
      `http://localhost:3000/auth/verify2fa`,
      body,
      this.basicHeaders
    );
  }

  getDataUser(login: string) {
    return this.http.get(`http://localhost:3000/db-writer/data/${login}`);
  }
}
