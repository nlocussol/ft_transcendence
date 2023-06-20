import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from './service/game.service';
import { GameData, Side} from './models/game.models';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styles: ['canvas { border-style: solid }'],
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  width: number = 858;
  height: number = 525;
  buttonSearchingGame: boolean = false;
  myUUID: string = crypto.randomUUID();
  gameData?: GameData;
  offsetFromWall: number = 50;
  interval: any;

  constructor(private gameService : GameService) {
  }

  ngOnInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

  }

  ngOnDestroy() {

  }

  async enterQueue(element: any) {
    if (!this.buttonSearchingGame) {
      element.textContent = "SEARCHING...";
      this.buttonSearchingGame = true;

      // Send post request with playerUUID
      this.gameService.enterQueue(this.myUUID).subscribe();
      do {
        await this.waitMilliSec(100);
        // Send a get request to see if another player is waiting for a game
        this.gameService.refreshQueue(this.myUUID).subscribe((res) => {
          if (res.matchUUID) {
            this.gameData = res;
          }
        });
      } while (this.gameData?.matchUUID == undefined);
      console.log("Match found");
      this.handleGame();
      // this.gameLoop();
    } else {
      element.textContent = "CLICK TO ENTER QUEUE";
      this.buttonSearchingGame = false;
      this.gameService.exitQueue(this.myUUID).subscribe();
    }
  }

  waitMilliSec(ms: number): Promise<void> {
    return new Promise((res) => {
      setTimeout(() => {
        res();
      }, ms);
    });
  }

  handleGame() {
    this.gameService.connectToSocket();
    this.gameService.emitToSocket(this.gameData);
  }

  // async gameLoop() {
  //   this.handleData();
  //   this.drawGame();
  //   requestAnimationFrame(() => this.gameLoop())
  // }

  // handleData() {
  //   this.gameService.getCurrentGameData(this.gameData?.matchUUID).subscribe(res => {
  //     this.gameData!.ball = res.ball;
  //     if (res.player[Side.RIGHT].UUID == this.myUUID) {
  //       this.gameData!.player[Side.LEFT].posY = res.player[Side.LEFT].posY;
  //       this.gameData!.player[Side.LEFT].posX = res.player[Side.LEFT].posX;
  //       this.gameData!.player[Side.LEFT].height = res.player[Side.LEFT].height;
  //       this.gameData!.player[Side.LEFT].width = res.player[Side.LEFT].width;
  //     } else {
  //       this.gameData!.player[Side.RIGHT].posY = res.player[Side.RIGHT].posY;
  //       this.gameData!.player[Side.RIGHT].posX = res.player[Side.RIGHT].posX;
  //       this.gameData!.player[Side.RIGHT].height = res.player[Side.RIGHT].height;
  //       this.gameData!.player[Side.RIGHT].width = res.player[Side.RIGHT].width;
  //     }
  //     console.log(this.gameData);
  //   });
  //   // move in below condition to change good player pos
  //   if (this.gameData?.player[Side.RIGHT].UUID === this.myUUID) {
  //     this.gameService.patchPlayerData(this.gameData?.matchUUID, this.gameData?.player[Side.LEFT], this.myUUID).subscribe();
  //   } else {
  //     this.gameService.patchPlayerData(this.gameData?.matchUUID, this.gameData?.player[Side.RIGHT], this.myUUID).subscribe();
  //   }
  // }

  // drawGame() {
  //   this.context.fillStyle = 'black';
  //   this.context.fillRect(0,0,this.width,this.height);
  //   this.context.fillStyle = 'white';
  //   console.log(this.gameData);
  //   if (this.myUUID == this.gameData?.player[0].UUID) {
  //     this.context.fillRect(this.offsetFromWall, this.gameData?.player[0].posY as number, 10, 10);
  //     this.context.fillRect(this.width - this.offsetFromWall, this.gameData?.player[1].posY as number, 10, 10);
  //   } else {
  //     this.context.fillRect(this.offsetFromWall, this.gameData?.player[1].posY as number, 10, 10);
  //     this.context.fillRect(this.width - this.offsetFromWall, this.gameData?.player[0].posY as number, 10, 10);
  //   }
  //   this.context.beginPath();
  //   this.context.fillStyle = 'white';
  //   if (this.gameData?.ball?.posX != undefined && this.gameData?.ball.posY) {
  //     this.context.arc(this.gameData?.ball?.posX, this.gameData?.ball?.posY, 5, 2 * Math.PI, 0);
  //   }
  //   this.context.fill();
  //   this.context.closePath();
  //   // this.gameLoop();
  // }
}
