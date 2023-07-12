import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuardService {
  authenticated: boolean = false;

  constructor(private authService: AuthService) {}

  canActivate(): Observable<boolean> {
    return this.authService.getTokenValidation();
  }
}
