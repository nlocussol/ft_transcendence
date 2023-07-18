import { Injectable, OnInit } from '@angular/core';
import { HomeService } from '../home/service/home.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Friend, UserData } from '../chat-room/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProfileService implements OnInit {
  basicHeaders = { headers: new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`) }
  private readonly API_ENDPOINT_GAME = 'http://localhost:3000/game';
  socket: any;
  login!: string;


  constructor(private homeService: HomeService, private http: HttpClient) {}

  ngOnInit(): void {
    this.homeService.getUser().subscribe((res) => {
      this.login = res.login;
    });
  }

  sendPrivateGameData(gameData: any) {
    return this.http.post('http://localhost:3000/game/private-game', gameData);
  }

  getProfilePic(login: string) {
    return this.http.get(`http://localhost:3000/db-writer/user-pp/${login}`, { responseType: 'blob' })
  }

  deleteNotif(body: any) {
    return this.http.post('http://localhost:3000/db-writer/delete-notif/', body, this.basicHeaders)
  }

  addFriend(body: any) {
    return this.http.post('http://localhost:3000/db-writer/add-friend/', body, this.basicHeaders)
  }

  getProfileData(login: string) {
    return this.http.get<UserData>(`http://localhost:3000/db-writer/data/${login}`)
  }

  getUserFriends(login: string) {
    return this.http.get<Friend[]>(`http://localhost:3000/db-writer/friends/${login}`)
  }

  changeUserPseudo(body: any) {
    return this.http.post('http://localhost:3000/db-writer/change-user-pseudo/', body, this.basicHeaders)
  }

  uploadImage(formData: FormData, login: string) {
    return this.http.post(`http://localhost:3000/db-writer/upload/${login}`, formData)
  }

  changeUserPp(obj: any) {
    return this.http.post('http://localhost:3000/db-writer/change-user-pp', obj, this.basicHeaders)
  }

  change2FA(body: any) {
    return this.http.post('http://localhost:3000/db-writer/change-2fa/', body, this.basicHeaders)
  }
}
