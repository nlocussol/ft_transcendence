import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import { Emitters } from '../emitters/emitters';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  login!: string;
  profileData: any;
  pin!: string;
  doubleAuthQrCode!: string;

	constructor(private http: HttpClient, private dataService: DataService, private router: Router) {}

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const code: string | null= urlParams.get('code');
    if (code)
      this.getAccessToken(code);
  }
  
  async sendUserData(data: any) {
    const body = {
      login: data.login,
      email: data.email,
      pp: data.image.versions.medium
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer/create-user/', body, { headers }).subscribe()
    // this.router.navigateByUrl("/profile");
  }

  async getUserData(accessToken: string) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`)
    const res: any = await this.http.get('https://api.intra.42.fr/v2/me', { headers }).toPromise()
    this.login = await res.login;
    this.dataService.setLoginPseudo(this.login, this.login)
    this.sendUserData(res)
    // check if 2fa is needed
    this.profileData = await this.http.get(`http://localhost:3000/db-writer/data/${this.login}`).toPromise()

    // Send user info to API and redirect user to homepage once he received jwt cookie
    this.http.post('http://localhost:3000/auth/login', {login: this.login}).subscribe(() => {
      Emitters.authEmitter.emit(true);
      this.router.navigate(['/']);
    });

    // if (this.profileData.doubleAuth === true){
    // }
    // this.doubleFactorAuth();
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


  doubleFactorAuth(){
    // init new qr code
    // this.doubleAuthQrCode = `https://www.authenticatorApi.com/pair.aspx?AppName=Pozo&AppInfo=${this.login}&SecretCode=${this.profileData.authCode}`;
    // if (this.doubleAuthQrCode)
    //   window.open(this.doubleAuthQrCode, '_blank');
  }

  async submitPin(){
    const body = new URLSearchParams({
      pin : this.pin,
    });
    // const res: any = await this.http.get(`https://www.authenticatorApi.com/Validate.aspx?Pin=${this.pin}&SecretCode=${this.profileData.authCode}`).toPromise()
    // const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    // const res: any = await this.http.post(`https://www.authenticatorapi.com/api.asmx/ValidatePin?pin=${this.pin}&SecretCode=${this.profileData.authCode}`, body.toString(), { headers }).toPromise()
    // console.log("Return : ", res);
    // let status = totp.check(this.pin, this.profileData.authCode);
    console.log("OH LE STATUS: ", status)
  }
}
