import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from './service/game.service';
import { GameData, movement, Player } from './models/game.models';
import { Socket } from 'socket.io-client';
import { FontFaceSet } from 'css-font-loading-module'
import { DataService } from '../services/data.service';
import { MatDialog } from '@angular/material/dialog'
import { Dialog } from '@angular/cdk/dialog';
import { DialogNotLoguedComponent } from '../dialog-not-logued/dialog-not-logued.component';

const TICKRATE = 15,
BALL_SIZE = 10;

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
  myUUID!: string;
  gameData: GameData = new GameData();
  offsetFromWall: number = 50;
  interval: any;
  animationId: any;
  isMoving: boolean[] = [false, false];
  fontSize: number = 30;
  myFont!: FontFace;
  messageButton: string = "FIND A GAME";
  searchingGame: boolean = false;
  inGame: boolean = false;
  pseudo?: string;
  loguedIn: boolean = false;
  queueTimeElapsed!: number;
  queueInterval: any;
  refreshQueueInterval: any;
  gameID!: string;

  constructor(private gameService : GameService, private dataService: DataService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    // Need to check if the user is already in game
    this.gameService.getUser().subscribe({
      next: (res) => {
        this.pseudo = res.pseudo;
        this.loguedIn = true;
        // this.myUUID = this.dataService.getLogin();
    },
      error: () => {
        this.dialog.open(DialogNotLoguedComponent, {
          width: '250px',
        });
      }
    })

    this.canvas = this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.font = String(this.fontSize) + "px PressStart2P";
    this.myFont = new FontFace('PressStart2P', 'url(../../assets/PressStart2P-Regular.ttf');
    this.myFont.load().then(function(font){
      document.fonts.add(font);
  // console.log("Font loaded");
    })
  }

  ngOnDestroy() {
    clearInterval(this.queueInterval);
    clearInterval(this.refreshQueueInterval);

    if (this.searchingGame) {
      this.gameService.exitQueue(this.pseudo!);
    }
  }

  enterQueue(element: any) {
    this.gameService.enterQueue(this.pseudo!).subscribe();
    this.searchingGame = true;
    element.textContent = "In queue..."
    this.startTimer();
    this.refreshQueue();
    // this.animate();
    // this.gameService.connectToSocket();
    // this.gameService.joinGameRoom(this.myUUID);
    // this.gameService.updateGame().subscribe((payload: GameData) => {
    //   if (payload.players[0] && payload.players[1]) {
    //     this.gameData = payload;
    // }
    // })
    // // need to clear this.interval
    // this.interval = setInterval(() => {
    //   this.gameService.sendPlayerInfo(this.getUUIDAndMove());
    // }, TICKRATE);


    // if (!this.buttonSearchingGame) {
    //   element.textContent = "SEARCHING...";
    //   this.buttonSearchingGame = true;

    //   // Send post request with playerUUID
    //   this.gameService.enterQueue(this.myUUID).subscribe();
    //   do {
    //     await this.waitMilliSec(100);
    //     // Send a get request to see if another player is waiting for a game
    //     this.gameService.refreshQueue(this.myUUID).subscribe((res) => {
    //       if (res.matchUUID) {
    //         this.gameData = res;
    //       }
    //     });
    //   } while (this.gameData?.matchUUID == undefined);
    //   console.log("Match found");
    //   this.gameService.connectToSocket();
    //   this.gameService.joinGameRoom(this.gameData);
    //   this.gameLoop();
    // } else {
    //   element.textContent = "CLICK TO ENTER QUEUE";
    //   this.buttonSearchingGame = false;
    //   this.gameService.exitQueue(this.myUUID).subscribe();
    // }
  }

  // Queue timer
  startTimer() {
    if (this.searchingGame) {
      const startTime = Date.now() - (this.queueTimeElapsed || 0);
      this.queueInterval = setInterval(() => {
        this.queueTimeElapsed = (Date.now() - startTime) / 1000;
        this.queueTimeElapsed = Math.trunc(this.queueTimeElapsed);
      }, 1000);
    }
  }

  // Send a get request with pseudo to API, expect a matchID in return
  refreshQueue() {
    this.refreshQueueInterval = setInterval(() => {
      this.gameService.refreshQueue(this.pseudo!).subscribe({
        next: res => {
          this.gameID = res;
          console.log(this.gameID);
          this.startGame();
          clearInterval(this.refreshQueueInterval);
        },
        error: err => console.log(err),
      });
    }, 1000);
  }


  leaveQueue() {
    this.gameService.exitQueue(this.pseudo!).subscribe();
    this.searchingGame = false;
    clearInterval(this.queueInterval);
    clearInterval(this.refreshQueueInterval);
  }

  startGame() {
    this.gameService.connectToSocket(this.pseudo!);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.gameData.players[0] && this.gameData.players[1]) {
      this.draw();
    } else {
      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }

  draw() {
    // Draw background
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);

    // Draw players
    this.context.fillStyle = 'white';
    this.context.fillRect(this.gameData.players[0].posX!, this.gameData.players[0].posY!, this.gameData.players[0].width!, this.gameData.players[0].height!);
    this.context.fillRect(this.gameData.players[1].posX!, this.gameData.players[1].posY!, this.gameData.players[1].width!, this.gameData.players[1].height!);

    // Draw ball
    this.context.fillRect(this.gameData.ball?.posX!, this.gameData.ball?.posY!, BALL_SIZE, BALL_SIZE)

    this.drawScore();
    this.drawCenterLine();
  }

  drawScore() {
    this.context.font = this.fontSize + "px 'PressStart2P'";

    this.context.fillText(String(this.gameData.players[0].score), this.width / 2 - 100, 50);
    this.context.fillText(String(this.gameData.players[1].score), this.width / 2 + 100, 50);
  }

  drawCenterLine() {
    for( let i: number = 0; i < this.height; i+=30) {
      this.context.fillRect(this.width / 2 - 10, i + 10, 15, 20);
    }
  }

  getUUIDAndMove(): {} {
    const players: Player[] = this.gameData.players;
    if (players[0].UUID == this.myUUID) {
      const player: Player = this.gameData.players[0];
      return {
        UUID: player.UUID,
        isMovingUp: this.isMoving[movement.UP],
        isMovingDown: this.isMoving[movement.DOWN]
      }
    } else {
      const player: Player = this.gameData.players[1];
      return {
        UUID: player.UUID,
        isMovingUp: this.isMoving[movement.UP],
        isMovingDown: this.isMoving[movement.DOWN]
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: any) {
    if (event.key === 'w') {
      this.isMoving[movement.UP] = true;
    }
    if (event.key === 's') {
      this.isMoving[movement.DOWN] = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: any) {
    if (event.key === 'w') {
      this.isMoving[movement.UP] = false;
    }
    if (event.key === 's') {
      this.isMoving[movement.DOWN] = false;
    }
  }
}
