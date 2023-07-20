import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environment';
import { Socket, io } from 'socket.io-client';
import { RoomMessage, UserData } from '../chat-room/interfaces/interfaces';
import { Notif, addFriend } from './interfaces/interfaces';
import { HomeService } from '../home/service/home.service';
import { Router } from '@angular/router';
import { ProfileService } from './profile.service';
import { ChatRoomService } from '../chat-room/chat-room.service';
import { HeaderService } from '../header/header.service';
import { AuthHandlerService } from '../auth-handler/auth-handler.service';
import { DataService } from '../services/data.service';

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
  myUserPage!: string;

  ngOnInit(): void {
    this.homeService.getUser().subscribe((res) => {
      this.login = res.login;
      this.pseudo = res.pseudo;
      this.myUserPage = `/user-page/${res.login}`
      this.getProfileData();
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.newNotif();
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
    let index: number[] = [];
    for (let notif of this.notifs) {
      if (notif.type === 'MATCH_REFUSED' || notif.type === 'BLOCK')
        index.push(this.notifs.findIndex(notifs => notifs === notif))
    }
    index.reverse()
    this.profileService.deleteNotifs({login: this.login, index: index}).subscribe()
  }

  constructor(
    private homeService: HomeService,
    private router: Router,
    private profileService: ProfileService,
    private roomService: ChatRoomService,
    private headerService: HeaderService,
    private authHandlerService: AuthHandlerService,
    private dataService: DataService
  ) {}

  onFileSelected(event: any): void {
    const selectedFile = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);
    this.profileService.uploadImage(formData, this.login).subscribe({
      next: (res: any) => {
        this.profileService.changeUserPp({login: this.login, newPp: res.name}).subscribe(() => {
          this.profileService.getProfilePic(this.login).subscribe((ppData: any) => {
            this.ppUrl = URL.createObjectURL(ppData);
          });
        })
      },
      error: (error: any) => console.log('ERROR', error)
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
    const regex = new RegExp(/[a-zA-Z0-9]*/)
    const regArray = regex.exec(this.newPseudo);
    if (this.newPseudo.length > 16 || regArray?.[0] !== regArray?.input)
      return ;
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
    console.log(body);
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
        this.profileService.getProfileData(body.login).subscribe((friendData: UserData) => {
          bodyToSend = {
            uuid: crypto.randomUUID(),
            player1: this.login,
            player1pseudo: this.pseudo,
            player2: body.login,
            player2pseudo: friendData.pseudo
          };
          this.profileService.sendPrivateGameData(bodyToSend).subscribe(() => {
            this.router.navigate(['/game']);
          });
        })
        break;

      case 'ROOM_INVITE':
        if (body.name) {
          bodyToSend = {
            pseudo: this.pseudo,
            login: this.login,
            name: body.name,
          }
          this.socket.emit('request-join-room', bodyToSend)
          const bodyMessage: RoomMessage = {
            sender: 'BOT',
            name: body.name,
            content: `${this.pseudo} has join the room!`,
          }  
          this.socket.emit('add-room-msg', bodyMessage);
        }
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
    if (body.type === 'REQUEST_MATCH'){
      const bodyRefuse = {
        friend: body.login,
        login: this.login,
        content: `${this.pseudo} refused your duel!`,
        type: 'MATCH_REFUSED'
      }
      this.socket.emit('send-notif', bodyRefuse);
    }
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
      if (this.notifs.find(notif => notif.type === 'MATCH_REFUSED'))
        this.dataService.setPrivateGameInvit(false)
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
      if (data.friend === this.pseudo || data.friend === this.login) {
        if (!this.notifs) this.notifs = [];
        if (data.login) this.notifs.push(data);
        if (data.type === 'MATCH_REFUSED') {
          this.dataService.setPrivateGameInvit(false)
        }
      }
    });
  }

  handleFriendSubmit() {
    if (this.pseudoFriend === this.pseudo) {
      console.log('You can not send friend request to yourself');
      this.pseudoFriend = '';
      return 
    }
    const body = {
      friend: this.pseudoFriend,
      login: this.login,
      content: `${this.pseudo} want to be your friend!`,
      type: 'REQUEST_FRIEND',
    };
    this.profileService.getProfileData(this.login).subscribe(async (userData: UserData) => {
      this.profileData = userData
      for (let friend of userData.friends) {
        const userData: UserData = await this.profileService.getProfileData(friend.name).toPromise() as UserData
        if (userData.pseudo === body.friend) {
          console.log(`${body.friend} is already your friend`);
          return ;
        }
      } 
      this.socket.emit('send-notif', body);
    })
    this.pseudoFriend = '';
  }
}
