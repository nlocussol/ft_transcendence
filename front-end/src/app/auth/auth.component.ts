import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  login!: string;

	constructor(private http: HttpClient, private dataService: DataService) {}
  
  async sendUserData(data: any) {
    const body = {
      pseudo: data.login,
      login: data.login,
      email: data.email,
      pp: data.image.versions.medium
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    await this.http.post('http://localhost:3000/db-writer/create-user/', body, { headers }).subscribe()
}

  async getUserData(accessToken: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`)
    const res: any = await this.http.get('https://api.intra.42.fr/v2/me', { headers }).toPromise()
    this.login = await (res.login);
    this.dataService.setLogin(this.login)
    this.sendUserData(res)
  }

  async getAccessToken(code: string) {
    
    const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "u-s4t2ud-d4f9852c6392f3a567c8fb78fac0ffaa6a248187093e5a84ba0a0b1e507c8f01",
          client_secret: "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",
          code: code,
          redirect_uri: "http://localhost:4200/auth"
    });
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    const res: any = await this.http.post('https://api.intra.42.fr/oauth/token', body.toString(), { headers }).toPromise()
    this.getUserData(res.access_token)
   }

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code: string | null= urlParams.get('code');
    if (code) {
      this.getAccessToken(code);
    }
  }
}
