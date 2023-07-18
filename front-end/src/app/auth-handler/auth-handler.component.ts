import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthHandlerService } from './auth-handler.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogFirstLoginComponent } from '../dialog-first-login/dialog-first-login.component';
import { Emitters } from '../emitters/emitters';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { HttpClient } from '@angular/common/http';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-auth-handler',
  templateUrl: './auth-handler.component.html',
  styleUrls: ['./auth-handler.component.css'],
})
export class AuthHandlerComponent implements OnInit, OnDestroy {
  errorBool: boolean = false;
  twoFa: boolean = false;
  socket!: Socket;
  qrcode: string = '';
  pin!: number;
  login!: string;

  constructor(
    private authHandlerService: AuthHandlerService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.socket = io(environment.SOCKET_ENDPOINT);
    const urlQuery = new URLSearchParams(window.location.search);
    const code = urlQuery.get('code');
    if (code != null || code != undefined) {
      this.authHandlerService.retrieveAccessToken(code).subscribe({
        next: (res) => this.getUserDataFrom42(res),
        error: (err) => this.handleErrorPost42Api(err),
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  getUserDataFrom42(res: string) {
    this.authHandlerService.getUserData(res).subscribe({
      next: (res) => this.handleConnexion(res),
      error: (err) => console.log(err),
    });
  }

  allowTowFa() {
    this.twoFa = true;
    this.authHandlerService.getQrCode(this.login).subscribe((img: any) => {
        this.qrcode = img;
      });
  }

  verifyPin() {
    const body = {
      pin: this.pin,
      login: this.login,
    };
    this.authHandlerService.verify2fa(body)
      .subscribe((verify: any) => {
        if (verify) {
          this.authHandlerService.getJwt(this.login).subscribe(() => {
            Emitters.authEmitter.emit(true);
            //add to error
            this.socket.emit('user-change-status', {
              login: this.login,
              status: 'ONLINE',
            });
            this.router.navigate(['/profile']);
          });
        }
      });
  }

  handleConnexion(res: any) {
    const userData = {
      login: res.login,
      pseudo: res.pseudo,
      pp: res.image.versions.small,
      doubleAuth: false,
    };

    this.login = res.login;
    this.authHandlerService.getDataUser(this.login)
      .subscribe((res: any) => {
        this.twoFa = res.doubleAuth;
      });

    this.authHandlerService.sendLogin(this.login).subscribe({
      next: () => {
        if (this.twoFa) this.allowTowFa();
        else {
          this.authHandlerService.getJwt(userData.login).subscribe(() => {
            Emitters.authEmitter.emit(true);
            //add to error
            this.socket.emit('user-change-status', {
              login: userData.login,
              status: 'ONLINE',
            });
            this.router.navigate(['/profile']);
          });
        }
      },
      error: (err) => {
        if (err.error.message === 'No user with this login') {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.closeOnNavigation = false;
          dialogConfig.width = '500';
          dialogConfig.height = '500';
          dialogConfig.enterAnimationDuration = '500ms';
          dialogConfig.exitAnimationDuration = '500ms';
          dialogConfig.data = {
            login: userData.login,
            pseudo: userData.login,
            pp: userData.pp,
          };
          const dia = this.dialog.open(DialogFirstLoginComponent, dialogConfig);
          dia.afterClosed().subscribe((res) => {
            userData.pseudo = res.pseudo;
            userData.doubleAuth = res.doubleAuth;
            if (res.file) {
              const imageData: FormData = new FormData();
              imageData.append('file', res.fileSource, res.fileSource.name);
              this.profileService.uploadImage(imageData, userData.login).subscribe((res:any) => {
                userData.pp = res.name
                this.authHandlerService.createUser(userData).subscribe((res) => {
                  this.authHandlerService.sendLogin(userData.login).subscribe({
                    next: () => {
                      this.authHandlerService.getJwt(userData.login).subscribe(res => {
                        Emitters.authEmitter.emit(true)
                        this.router.navigate(['/profile'])
                      })
                    }
                  })
                })
              });
            } else {
              this.authHandlerService.sendIntraProfilePicUrl(userData.login, userData.pp).subscribe((ppUrl) => {
                userData.pp = ppUrl;
                this.authHandlerService.createUser(userData).subscribe((res) => {
                  this.authHandlerService.sendLogin(userData.login).subscribe({
                    next: () => {
                      this.authHandlerService.getJwt(userData.login).subscribe(res => {
                        Emitters.authEmitter.emit(true)
                        this.router.navigate(['/profile'])
                      })
                    }
                  })
                })
              })
            }
          });
        }
      },
    });
  }

  handleErrorPost42Api(err: string) {
    console.log('Error while 42 POST Api call: ', err);
    this.errorBool = true;
    setTimeout(() => {
      this.router.navigate(['/auth']);
    }, 3000);
  }
}
