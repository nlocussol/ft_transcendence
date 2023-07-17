import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../profile/profile.service';
import { UserData } from '../chat-room/interfaces/interfaces';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent{
  found:boolean = true;
  pseudo:string;
  ppUrl!: string;
  status!: string;
  stats!: any;
  winRate!: string;
  history!: any[];

  constructor (private route: ActivatedRoute, private profileService: ProfileService){
    this.pseudo = "";
    this.route.params.subscribe(params => {
      this.pseudo = params['pseudo'];
      console.log(this.pseudo)
    })
    this.getProfileData();
  }

  async getProfileData(){
    this.profileService.getProfileData(this.pseudo).subscribe((profileData: UserData) => {
      if (profileData == null)
        this.found = false;
      this.profileService.getProfilePic(profileData.login).subscribe((ppData: Blob) => {
        this.ppUrl = URL.createObjectURL(ppData);
      });
      this.status = profileData.status;
      this.stats = profileData.stats;
      this.winRate =  (this.stats.win * 100 / this.stats.matchs).toFixed(2);
      this.history = profileData.history;
    })
  }
}
