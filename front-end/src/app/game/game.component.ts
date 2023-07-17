import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GameService } from './service/game.service';
import { GameData, movement, Player } from './models/game.models';
import { Socket } from 'socket.io-client';
import { FontFaceSet } from 'css-font-loading-module';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { DialogNotLoguedComponent } from '../dialog-not-logued/dialog-not-logued.component';
import { Subject, map } from 'rxjs';
import { Emitters } from '../emitters/emitters';

const TICKRATE = 15;
  // BALL_SIZE = 10;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styles: ['canvas { border-style: solid }'],
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  width: number = 858;
  height: number = 525;
  // heightDiff: number = 0;
  heightInit: number = 525;
  widthInit: number = 858;
  gameData: GameData = new GameData();
  isMoving: boolean[] = [false, false];
  fontSize: number = 30;
  myFont!: FontFace;
  searchingGame: boolean = false;
  inGame: boolean = false;
  login?: string;
  loguedIn: boolean = false;
  queueTimeElapsed!: number;
  queueInterval: any;
  refreshQueueInterval: any;
  movePlayerInterval: any;
  gameID!: string;
  animationId: any = undefined;
  loadOnce: boolean = false;
  ballSize = 10;
  widthPercent = 1;
  heightPercent = 1
  autoReconnectInterval: any;

  constructor(private gameService: GameService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.gameService.getUser().subscribe({
      next: (res) => {
        this.login = res.login;
        this.loguedIn = true;
        this.gameService.connectToSocket(this.login as string);
        this.autoReconnectInterval = setInterval(() => this.gameService.isInGame(res.login).subscribe({
          next: () => {
            clearInterval(this.autoReconnectInterval);
            this.enterQueue(undefined);
          },
          error: () => {}
        }), 300);
      },
      error: () => {
        this.dialog.open(DialogNotLoguedComponent, {
          width: '250px',
        });
      },
    });

    this.canvas = this.myCanvas.nativeElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.context.font = String(this.fontSize) + 'px PressStart2P';
    this.myFont = new FontFace(
      'PressStart2P',
      'url(../../assets/PressStart2P-Regular.ttf'
    );
    this.myFont.load().then(function (font) {
      document.fonts.add(font);
    });
  }

  ngOnDestroy() {
    clearInterval(this.queueInterval);
    clearInterval(this.refreshQueueInterval);
    clearInterval(this.movePlayerInterval);
    clearInterval(this.autoReconnectInterval);
    this.gameService.disconnectFromSocket();
  }

  enterQueue(element: any) {
    this.searchingGame = true;
    this.gameData.inProgress = true;
    this.gameData.isOver = false;
    this.gameService.enterQueue();
    this.startTimer();
    this.startGame();
  }

  startGame() {
    this.gameService
      .connectToGameUpdate(this.gameID)
      .subscribe((payload) => this.gameLoop(payload));
  }

  gameLoop(payload: GameData) {
    if (payload.players.length != 0) {
      this.gameData = payload;
      if (!this.loadOnce) {
        this.searchingGame = false;
        this.inGame = true;
        this.startAnimationFrame();
        this.movePlayer();
        this.loadOnce = true;
      }
      if (!this.gameData.inProgress && this.gameData.isOver) {
        this.handleEndGame();
        this.loadOnce = false;
      }
    }
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

  leaveQueue() {
    this.searchingGame = false;
    clearInterval(this.queueInterval);
    clearInterval(this.refreshQueueInterval);
    clearInterval(this.movePlayerInterval);
    this.gameService.leaveQueue();
  }

  animate() {
    this.animationId = window.requestAnimationFrame(this.animate.bind(this));
    if (this.gameData?.players[0] && this.gameData?.players[1]) {
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
    this.context.fillRect(
      this.gameData?.players[0].posX! * this.widthPercent,
      this.gameData?.players[0].posY! * this.heightPercent,
      this.gameData?.players[0].width! * this.widthPercent,
      this.gameData?.players[0].height! * this.heightPercent
    );
    this.context.fillRect(
      this.gameData?.players[1].posX! * this.widthPercent,
      this.gameData?.players[1].posY! * this.heightPercent,
      this.gameData?.players[1].width! * this.widthPercent,
      this.gameData?.players[1].height! * this.heightPercent
    );

    // Draw ball
    this.context.fillRect(
      this.gameData?.ball?.posX! * this.widthPercent,
      this.gameData?.ball?.posY! * this.heightPercent,
      this.ballSize,
      this.ballSize
    );

    this.drawScore();
    this.drawCenterLine();
  }

  drawScore() {
    this.context.font = this.fontSize + "px 'PressStart2P'";

    this.context.fillText(
      String(this.gameData?.players[0].score),
      this.width / 2 - 100,
      50
    );
    this.context.fillText(
      String(this.gameData?.players[1].score),
      this.width / 2 + 100,
      50
    );
  }

  drawCenterLine() {
    let lineHeight = this.height / 17.5;
    for (let i: number = 0; i < this.height; i += lineHeight) {
      this.context.fillRect(this.width / 2 - lineHeight / 3, i + lineHeight/3, lineHeight/2, lineHeight / 2 + lineHeight / 5 );
    }
  }

  movePlayer() {
    this.movePlayerInterval = setInterval(() => {
      this.gameService.sendPlayerData({
        login: this.login,
        isMovingUp: this.isMoving[movement.UP],
        isMovingDown: this.isMoving[movement.DOWN],
      });
    }, TICKRATE);
  }

  handleEndGame() {
    this.inGame = false;
    this.gameService.exitRoom();
    clearInterval(this.movePlayerInterval);
    setTimeout(() => this.stopAnimationFrame(), 300);
  }

  startAnimationFrame() {
    if (!this.animationId) {
      this.animationId = window.requestAnimationFrame(this.animate.bind(this));
    }
  }

  stopAnimationFrame() {
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.inGame === false || event.target.innerWidth < 1500 || event.target.innerHeight < 1000)
      return    
    this.widthPercent = (event.target.innerWidth - this.widthInit) / this.widthInit;
    this.heightPercent = (event.target.innerHeight - this.heightInit) / this.heightInit;
    this.width = this.widthInit * this.widthPercent;
    this.height =  this.heightInit * this.heightPercent;
  }
}
