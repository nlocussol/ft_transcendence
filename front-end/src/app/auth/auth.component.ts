import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
	constructor() {}

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code: string | null= urlParams.get('code');
    console.log("CODE:", code);
    if (code) {

      fetch("https://api.intra.42.fr/oauth/token",{
      method: 'POST',
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: "u-s4t2ud-d4f9852c6392f3a567c8fb78fac0ffaa6a248187093e5a84ba0a0b1e507c8f01",
        secret_id: "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",
        code: code,
        redirect_uri: "http://localhost:4200/auth"
      })
      })
    }
  }
}
