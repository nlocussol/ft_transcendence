import { Injectable } from "@angular/core";
import { Router, UrlTree} from "@angular/router";
import { AuthService } from "./auth.service";
import { Observable, map, filter } from "rxjs";

@Injectable()
export class AuthGuardService {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean> {
        return this.authService.getToken();
    }
}