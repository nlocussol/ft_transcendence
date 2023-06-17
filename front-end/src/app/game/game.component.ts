import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameService } from './service/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  width: number = 300;
  height: number = 300;
  searchingGame: boolean = false;
  UUID: string = crypto.randomUUID();

  constructor(private gameService : GameService) {

  }

  ngOnInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  enterQueue(element: any) {
    if (!this.searchingGame) {
      element.textContent = "CLICK TO ENTER QUEUE";
      this.searchingGame = true;
      this.gameService.enterQueue(this.UUID).subscribe();
    } else {
      element.textContent = "SEARCHING...";
      this.searchingGame = false;
      this.gameService.exitQueue(this.UUID).subscribe();
    }
  }

  exitQueue() {

  }
}
