import { Component, OnInit } from '@angular/core';
import { AuthHandlerService } from './auth-handler.service';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogFirstLoginComponent } from '../dialog-first-login/dialog-first-login.component';
import { Emitters } from '../emitters/emitters';

@Component({
  selector: 'app-auth-handler',
  templateUrl: './auth-handler.component.html',
  styleUrls: ['./auth-handler.component.css'],
})
export class AuthHandlerComponent implements OnInit {
  errorBool: boolean = false;

  constructor(
    private authHandlerService: AuthHandlerService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const urlQuery = new URLSearchParams(window.location.search);
    const code = urlQuery.get('code');
    console.log(code);
    if (code != null || code != undefined) {
      this.authHandlerService.retrieveAccessToken(code).subscribe({
        next: (res) => this.getUserDataFrom42(res),
        error: (err) => this.handleErrorPost42Api(err),
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  getUserDataFrom42(res: string) {
    console.log(res);
    this.authHandlerService.getUserData(res).subscribe({
      next: (res) => this.handleConnexion(res),
      error: (err) => console.log(err),
    });
  }

  handleConnexion(res: any) {
    const userData = {
      login: res.login,
      pp: res.image.versions.small,
      email: res.email,
    };

    this.authHandlerService.sendLogin(userData.login).subscribe({
      next: () => {
        this.authHandlerService.getJwt(userData.login).subscribe(() => {
          Emitters.authEmitter.emit(true);
          this.router.navigate(['/profile']);
        });
      },
      error: (err) => {
        if (err.error.message === 'No user with this login') {
          const dialogConfig = new MatDialogConfig();
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.closeOnNavigation = false;
          dialogConfig.width = '500';
          dialogConfig.height = '500';
          dialogConfig.data = { login: userData.login, pp: userData.pp };
          const dia = this.dialog.open(DialogFirstLoginComponent, dialogConfig);
          dia.afterClosed().subscribe((res) => {
            // Change below to send right infos
            this.authHandlerService.sendUserData(userData).subscribe(() => {
              this.authHandlerService.sendLogin(userData.login).subscribe({
                next: () => {
                  this.authHandlerService
                    .getJwt(userData.login)
                    .subscribe((res) => {
                      Emitters.authEmitter.emit(true);
                      this.router.navigate(['/profile']);
                    });
                },
              });
            });
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
