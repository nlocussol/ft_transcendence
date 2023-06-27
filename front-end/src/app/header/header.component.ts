import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  authenticated: boolean = false;

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    Emitters.authEmitter.subscribe(
      (auth: boolean) => {
        this.authenticated = auth;
      }
    );
  }

  logout() {
    this.headerService.logout().subscribe(() => {
      this.authenticated = false;
    });
  }
}
