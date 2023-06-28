import { Component, OnInit } from '@angular/core';
import { HomeService } from './home/service/home.service';
import { Emitters } from './emitters/emitters';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  authenticated: boolean = false;
  title = 'CORSE PONG';
  constructor(private homeService: HomeService) {}
  
  ngOnInit(): void {
    this.homeService.getUser().subscribe({
      next: () => {
        Emitters.authEmitter.emit(true);
    },
      error: () => {
        Emitters.authEmitter.emit(false);
      }
    })
  }
}
