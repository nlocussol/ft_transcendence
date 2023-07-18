import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environment';
import { Socket, io } from 'socket.io-client';
import { Friend, UserData } from '../chat-room/interfaces/interfaces';
import { Notif, addFriend } from './interfaces/interfaces';
import { HomeService } from '../home/service/home.service';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { ChatRoomService } from '../chat-room/chat-room.service';
import { HeaderService } from '../header/header.service';
import { AuthHandlerService } from '../auth-handler/auth-handler.service';

@Component({
  selector: 'app-profile',
  template: `{{ message }}`,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  pathToPp!: string //= 'http://localhost:3000/upload' // a modif
  doubleAuth!: boolean;
  selectedFile!: File;
  newPseudo!: string;
  pseudoFriend!: string;
  profileData!: UserData;
  pseudo!: string;
  login!: string;
  ppUrl!: any;
  status!: string;
  socket!: Socket;
  notifs!: Notif[];

  ngOnInit(): void {
    this.homeService.getUser().subscribe((res) => {
      this.login = res.login;
      this.pseudo = res.pseudo;
      this.getProfileData();
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.newNotif();
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  constructor(
    private homeService: HomeService,
    private router: Router,
    private profileService: ProfileService,
    private roomService: ChatRoomService,
    private headerService: HeaderService,
    private authHandlerService: AuthHandlerService
  ) {}

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);
    this.profileService.uploadImage(formData, this.login).subscribe((res: any) => {
      this.profileService.changeUserPp({login: this.login, newPp: res.name}).subscribe(() => {
        this.profileService.getProfilePic(this.login).subscribe((ppData: any) => {
          this.ppUrl = URL.createObjectURL(ppData);
        });
      })
    })
  }

  change2AF() {
    this.doubleAuth = !this.doubleAuth;
    const body = {
      login: this.login,
      doubleAuth: this.doubleAuth,
    };
    this.profileService.change2FA(body).subscribe()
  }

  async changeUsername() {
    const body = {
      currentLogin: this.login,
      newPseudo: this.newPseudo,
    };
    this.profileService.changeUserPseudo(body).subscribe((res: any) => {
      if (res) {
        this.pseudo = this.newPseudo;
        this.headerService.logout().subscribe(() => {
          this.authHandlerService.getJwt(this.login).subscribe()
        })
      }
      this.newPseudo = ''
    })
  }

  acceptRequest(body: Notif) {
    const bodyToDelete = {
      login: this.login,
      index: this.notifs.findIndex((notif) => notif === body),
    };
    let bodyToSend: any;
    switch (body.type) {
      case 'REQUEST_FRIEND':
        bodyToSend = {
          login: this.login,
          friend: body.login,
        };
        this.profileService.addFriend(bodyToSend).subscribe();
        break;
      case 'REQUEST_MATCH':
        bodyToSend = {
          uuid: crypto.randomUUID(),
          player1: this.login,
          player1pseudo: this.pseudo,
          player2: body.login,
          // NATHAN : Need other player pseudo here stp
          player2pseudo: body.pseudo
        };
        this.profileService.sendPrivateGameData(bodyToSend).subscribe(() => {
          this.router.navigate(['/game']);
        });
        break;

      case 'ROOM_INVITE':
        bodyToSend = {
          name: body.name,
          login: this.login,
          pseudo: this.pseudo,
        };
        this.roomService.addUserToRoom(body).subscribe();
        break;
    }
    this.notifs.splice(
      this.notifs.findIndex((request) => body === request),
      1
    );
    this.profileService.deleteNotif(bodyToDelete).subscribe();
  }

  refuseRequest(body: Notif) {
    const bodyToDelete = {
      login: this.login,
      index: this.notifs.findIndex((notif) => notif === body),
    };
    this.notifs.splice(
      this.notifs.findIndex((request) => body === request),
      1
    );
    this.profileService.deleteNotif(bodyToDelete).subscribe();
  }

  getProfileData() {
    this.profileService.getProfileData(this.login).subscribe((userData: UserData) => {
      this.profileData = userData;
      this.notifs = userData.notif;
      this.status = userData.status;
      this.doubleAuth = userData.doubleAuth;
      this.pseudo = userData.pseudo;
      this.profileService.getProfilePic(userData.login).subscribe((blob: Blob) => {
        this.ppUrl = URL.createObjectURL(blob);
      });
    })
  }

  newNotif() {
    this.socket.on('receive-notif', (data: Notif) => {
      if (data.friend === this.pseudo || (data.friend === this.login && data.type != 'REQUEST_MATCH')) {
        if (!this.notifs) this.notifs = [];
        if (data.login) this.notifs.push(data);
      }
    });
  }

  handleFriendSubmit() {
    const body = {
      friend: this.pseudoFriend,
      login: this.login,
      content: `${this.pseudo} want to be your friend!`,
      type: 'REQUEST_FRIEND',
    };
    this.profileService.getProfileData(this.login).subscribe((userData: UserData) => {
      this.profileData = userData
      if (userData.friends.find((friend: Friend) => friend.name === body.friend)) {
        console.log(body.friend, 'is already your friend!');
        return;
      } else if (this.pseudoFriend === this.pseudo) {
        console.log('You can not send friend request to yourself');
        return;
      }
      this.socket.emit('send-notif', body);
    })
    this.pseudoFriend = '';
  }
}
