import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogFirstLoginService {

  constructor(private http: HttpClient) { }

  sendTmpProfilePic(login: string, formData: FormData) {
    return this.http.post(`http:localhost:3000/tmp/${login}`, formData);
  }
}
