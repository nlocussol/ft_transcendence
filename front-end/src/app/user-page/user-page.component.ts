import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent{
  found:boolean = true;
  pseudo:string;
  profileData: any;
  ppUrl!: string;
  status!: string;
  stats!: any;
  winRate!: string;
  history!: any[];

  constructor (private http: HttpClient, private route: ActivatedRoute){
    this.pseudo = "";
    this.route.params.subscribe(params => {
      this.pseudo = params['pseudo'];
      console.log(this.pseudo)
    })
    this.getProfileData();
  }

  async getProfileData(){
    this.profileData = await this.http.get(`http://localhost:3000/db-writer/data/${this.pseudo}`).toPromise();
    if (this.profileData == null)
      this.found = false;
    this.ppUrl = this.profileData.pp;
    this.status = this.profileData.status;
    this.stats = this.profileData.stats;
    this.winRate =  (this.stats.win * 100 / this.stats.matchs).toFixed(2);
    this.history = this.profileData.history;
    console.log(this.stats)
  }
}
