import { Component, OnInit } from '@angular/core';
import { HomeService } from './home/service/home.service';
import { Emitters } from './emitters/emitters';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  authenticated: boolean = false;
  login!: string;
  constructor(private homeService: HomeService,
    private dataService: DataService) {}

  ngOnInit(): void {
    this.homeService.getUser().subscribe({
      next: (res) => {
        this.login = res.login;
        this.dataService.setUserLogin(this.login);
        Emitters.authEmitter.emit(true);
      },
      error: () => {
        Emitters.authEmitter.emit(false);
      },
    });
  }


}
