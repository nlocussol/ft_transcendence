import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthHandlerService } from './auth-handler.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogFirstLoginComponent } from '../dialog-first-login/dialog-first-login.component';
import { Emitters } from '../emitters/emitters';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { ProfileService } from '../profile/profile.service';
import { DataService } from '../services/data.service';

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
    private profileService: ProfileService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.socket = io(environment.SOCKET_ENDPOINT);
    const urlQuery = new URLSearchParams(window.location.search);
    const code = urlQuery.get('code');
    if (code != null || code != undefined) {
      this.authHandlerService.retrieveAccessToken(code).subscribe({
        next: (res) => this.getUserDataFrom42(res),
        error: () => this.handleErrorPost42Api(),
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  getUserDataFrom42(res: string) {
    this.authHandlerService.getUserDataFrom42(res).subscribe({
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
    this.authHandlerService.verify2fa(body).subscribe((verify: any) => {
      if (verify) {
        this.authHandlerService.getJwt(this.login).subscribe(() => {
          Emitters.authEmitter.emit(true);
          this.router.navigate(['/profile']);
        });
      }
    });
  }

  handleConnexion(res: any) {
    const userData = {
      login: res.login,
      pseudo: res.pseudo,
      pp: res.image.versions.medium,
      doubleAuth: false,
    };

    this.login = res.login;
    this.authHandlerService.getDataUser(this.login).subscribe((res: any) => {
      this.twoFa = res.doubleAuth;
    });

    this.authHandlerService.getUserDataFromDb(this.login).subscribe({
      next: () => {
        if (this.twoFa) this.allowTowFa();
        else {
          this.authHandlerService.getJwt(userData.login).subscribe(() => {
          this.dataService.setUserLogin(this.login);
            Emitters.authEmitter.emit(true);
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
              this.profileService
                .uploadImage(imageData, userData.login)
                .subscribe({
                  next: (res: any) => {
                    userData.pp = res.name;
                    this.authHandlerService
                      .createUser(userData)
                      .subscribe(() => {
                        this.authHandlerService
                          .getUserDataFromDb(userData.login)
                          .subscribe({
                            next: () => {
                              this.authHandlerService
                                .getJwt(userData.login)
                                .subscribe(() => {
                                  this.dataService.setUserLogin(userData.login);
                                  Emitters.authEmitter.emit(true);
                                  this.router.navigate(['/profile']);
                                });
                            },
                          });
                      });
                  },
                  error: () => {
                    this.router.navigate(['/']);
                  },
                });
            } else {
              this.authHandlerService
                .sendIntraProfilePicUrl(userData.login, userData.pp)
                .subscribe((ppUrl) => {
                  userData.pp = ppUrl;
                  this.authHandlerService
                    .createUser(userData)
                    .subscribe(() => {
                      this.authHandlerService
                        .getUserDataFromDb(userData.login)
                        .subscribe({
                          next: () => {
                            this.authHandlerService
                              .getJwt(userData.login)
                              .subscribe(() => {
                                this.dataService.setUserLogin(userData.login);
                                Emitters.authEmitter.emit(true);
                                this.router.navigate(['/profile']);
                              });
                          },
                        });
                    });
                });
            }
          });
        }
      },
    });
  }

  handleErrorPost42Api() {
    console.log('Error while 42 POST Api call');
    this.errorBool = true;
    setTimeout(() => {
      this.router.navigate(['/auth']);
    }, 3000);
  }
}
