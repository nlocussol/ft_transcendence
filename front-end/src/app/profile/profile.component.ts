import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profile',
  template: `{{message}}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  pseudo!: string;
  profileData: any;
  login: string = "! Go Login to get a profile card !";
  ppUrl!: string;
  status!: string;

  constructor(private http: HttpClient, private dataService: DataService) {
    const tmp: string = dataService.getLogin();
    if (!tmp)
      return ;
    this.login = tmp;
    console.log('My login:', this.login);
    this.getProfileData();
  }

  async getProfileData() {
    this.profileData = await this.http.get(`http://localhost:3000/db-writer/${this.login}`).toPromise()
    this.ppUrl = this.profileData.pp;
    this.status = this.profileData.status;
  }

  handleFriendSubmit() {
    const body = {
      friend: this.pseudo,
      pseudo: this.login
    }
    const headers = new HttpHeaders().set('Content-type', `application/json`)
    this.http.post("http://localhost:3000/db-writer/add-friend/", body, { headers }).subscribe()
  }
}
