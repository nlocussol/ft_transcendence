import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../profile/profile.service';
import { UserData } from '../chat-room/interfaces/interfaces';
import { UserPageService } from './user-page.service';

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
  stats: any = null;
  winRate!: string;
  history!: any[];

  constructor (private route: ActivatedRoute, private profileService: ProfileService, private userPageService:UserPageService){
    this.pseudo = "";
    this.route.params.subscribe(params => {
      this.pseudo = params['pseudo'];
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
      this.pseudo = profileData.pseudo
      this.status = profileData.status;
      this.stats = profileData.stats;
      this.winRate =  (this.stats.win * 100 / this.stats.matchs).toFixed(2);
      this.history = profileData.history;
      for (let i in this.history){
        this.userPageService
          .getProfileData(this.history[i].opponent)
          .subscribe((res: any) => {
            this.history[i].opponent = res.pseudo;
            if(this.history[i].ownScore > this.history[i].opponentScore)
              this.history[i].winner = this.pseudo
            else
              this.history[i].winner = this.history[i].opponent
        });
      }
    })
  }
}
