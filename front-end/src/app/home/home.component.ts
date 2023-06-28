import { Component, OnInit } from '@angular/core';
import { HomeService } from './service/home.service';
import { Emitters } from '../emitters/emitters';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message = ""

  constructor(
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    this.homeService.getUser().subscribe({
      next: (res) => {
        this.message = `HELLO ${res.login}`;
        Emitters.authEmitter.emit(true);
    },
      error: () => {
        this.message = 'LOG TOI CHACAL'
        Emitters.authEmitter.emit(false);
      }
    })
  }
}
