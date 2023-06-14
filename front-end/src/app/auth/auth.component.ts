import { Component } from '@angular/core';
import { HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent {
	constructor(private http: HttpClient) {}
	
	login (){
		this.http.get("https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d4f9852c6392f3a567c8fb78fac0ffaa6a248187093e5a84ba0a0b1e507c8f01&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fhome&response_type=code").subscribe(
			response => {
				console.log(response);
			},
			error => {
				console.log(error);
			}
		);
		//fetch("https://api.intra.42.fr/oauth/authorize")
		//.then(reponse => reponse.json())
		//.then(reponseBis => console.log(reponseBis))
		//.catch(error => console.log(error))
	}
}
