import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PongService } from './service/pong.service';
import { PongDataFront } from './pong.models';

@Component({
  selector: 'app-pong',
  templateUrl: './pong.component.html',
  styleUrls: ['./pong.component.css']
})
export class PongComponent implements OnInit{
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
  width!: number;
  height!: number;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  myUUID: string = crypto.randomUUID();
  gameFound: boolean = false;
  buttonSearchingGame = false;
  pongDataFront: PongDataFront = {
    matchUUID: undefined
  };


  constructor(private pongService: PongService) {
    this.pongDataFront.matchUUID = "grosfdp"
  }

  ngOnInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  async enterQueue(element: any) {
    if (!this.buttonSearchingGame) {
      element.textContent = "SEARCHING...";
      this.buttonSearchingGame = true;
      // Send post request with playerUUID
      this.pongService.enterQueue(this.myUUID).subscribe();
      do {
        await this.waitMilliSec(100);
        // Send a get request to see if another player is waiting for a game
        this.pongService.refreshQueue(this.myUUID).subscribe((res) => {
          if (res.matchUUID) {
            this.pongDataFront.matchUUID = res.matchUUID;
            console.log(this.pongDataFront.matchUUID);
          }
        });
      } while (this.pongDataFront.matchUUID == undefined);
      // this.connectToSocket();
    } else {
      element.textContent = "CLICK TO ENTER QUEUE";
      this.buttonSearchingGame = false;
      this.pongService.exitQueue(this.myUUID).subscribe();
    }
  }

  waitMilliSec(ms: number): Promise<void> {
    return new Promise((res) => {
      setTimeout(() => {
        res();
      }, ms);
    });
  }

  connectToSocket() {
    this.pongService.setupSocketConnection();
  }

  // enterQueue(event: any) {
  // }
}
