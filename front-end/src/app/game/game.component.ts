import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { GameService } from './service/game.service';
import { GameData, movement } from './models/game.models';
import { FontFaceSet } from 'css-font-loading-module'; // DO NOT REMOVE THIS ONE => NEED FOR LOADING FONT
import { DataService } from '../services/data.service';

const TICKRATE = 15,
  hsl = 'hsl(',
  hueBlackValues = ', 0%, 0%)',
  hueWhiteValues = ', 100%, 100%)',
  hueCustomDetails = ', 70%, 50%)',
  hueCustomField = ', 50%, 75%)';
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
  heightDiff: number = 0.5859375;
  widthDiff: number = 0.446875;
  heightInit: number = 525;
  invisbleLeft: number = 301;
  invisbleRight: number = 557;
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
  heightPercent = 1;
  autoReconnectInterval: any;
  imgJul = new Image();
  imgNinho = new Image();
  imgNaza = new Image();
  privateGameInvit!: boolean;

  constructor(
    private gameService: GameService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.imgJul.src = '../assets/JUL.jpg';
    this.imgNinho.src = '../assets/NINHO.jpeg';
    this.imgNaza.src = '../assets/NAZA.jpeg';
    this.privateGameInvit = this.dataService.getPrivateGameInvit();
    this.gameService.getUser().subscribe({
      next: (res) => {
        this.login = res.login;
        this.loguedIn = true;
        this.gameService.connectToSocket(this.login as string, res.pseudo);
        this.gameService.connectToStatusWS();
        this.autoReconnectInterval = setInterval(
          () =>
            this.gameService.autoReconnect(res.login).subscribe({
              next: (data: string) => {
                if (data && data.length) {
                  clearInterval(this.autoReconnectInterval);
                  this.enterQueueClassic();
                }
              },
              error: (err) => {
                if (err.status === 403) {
                  console.log('Forbidden error occurred. Retrying...');
                } else {
                  console.log('Error to find the game:');
                }
              },
            }),
          300
        );
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
    this.gameService.updateMyStatus(this.login!, 'ONLINE');
    clearInterval(this.queueInterval);
    clearInterval(this.refreshQueueInterval);
    clearInterval(this.movePlayerInterval);
    clearInterval(this.autoReconnectInterval);
    this.gameService.disconnectFromSocket();
    this.gameService.disconnectFromStatusWS();
  }

  enterQueueClassic() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.drawImage(this.imgJul, 0, 0, this.width, this.height);
    this.searchingGame = true;
    this.gameData.inProgress = true;
    this.gameData.isOver = false;
    this.gameService.enterQueue('classic');
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
        this.gameService.updateMyStatus(this.login!, 'IN_GAME');
        this.loadOnce = true;
      }
      if (this.gameData.isOver) {
        this.handleEndGame();
        this.loadOnce = false;
      }
    }
  }

  // Queue timer
  startTimer() {
    this.queueTimeElapsed = 0;
    if (this.searchingGame) {
      const startTime = Date.now() - (this.queueTimeElapsed || 0);
      this.queueInterval = setInterval(() => {
        this.queueTimeElapsed = (Date.now() - startTime) / 1000;
        this.queueTimeElapsed = Math.trunc(this.queueTimeElapsed);
      }, 1000);
    }
  }

  leaveQueue() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    this.searchingGame = false;
    clearInterval(this.queueInterval);
    clearInterval(this.refreshQueueInterval);
    clearInterval(this.movePlayerInterval);
    this.gameService.leaveQueue();
  }

  animate() {
    this.animationId = window.requestAnimationFrame(this.animate.bind(this));
    if (this.gameData?.players[0] && this.gameData?.players[1]) {
      this.draw(this.gameData.customGameMod as boolean);
    } else {
      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }

  draw(customGameMod: boolean) {
    // Draw background
    if (!customGameMod) {
      this.context.fillStyle = hsl + this.gameData.fieldColor + hueBlackValues;
    } else {
      this.context.fillStyle = hsl + this.gameData.fieldColor + hueCustomField;
    }
    this.context.fillRect(0, 0, this.width, this.height);

    // Draw players
    if (!customGameMod) {
      this.context.fillStyle = hsl + this.gameData.fieldColor + hueWhiteValues;
    } else {
      this.context.fillStyle =
        hsl + this.gameData.detailsColor + hueCustomDetails;
    }
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
    if (this.gameData.ball?.isVisible) {
      this.context.fillRect(
        this.gameData?.ball?.posX! * this.widthPercent,
        this.gameData?.ball?.posY! * this.heightPercent,
        this.ballSize,
        this.ballSize
      );
    }

    if (this.gameData.customGameMod) {
      this.context.fillRect(this.invisbleLeft, 0, 2, this.height);
      this.context.fillRect(this.invisbleRight, 0, 2, this.height);
    }

    this.drawScore();
    if (!this.gameData.customGameMod) {
      this.drawCenterLine();
    }
  }

  drawScore() {
    this.context.font = this.fontSize + "px 'PressStart2P'";

    this.context.fillText(
      String(this.gameData?.players[0].score),
      this.width / 2 - 50,
      50
    );
    this.context.fillText(
      String(this.gameData?.players[1].score),
      this.width / 2 + 20,
      50
    );
  }

  drawCenterLine() {
    let lineHeight = this.height / 17.5;
    for (let i: number = 0; i < this.height; i += lineHeight) {
      this.context.fillRect(
        this.width / 2 - lineHeight / 3,
        i + lineHeight / 3,
        lineHeight / 2,
        lineHeight / 2 + lineHeight / 5
      );
    }
  }

  drawEndGame() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.fillStyle = 'white';
    this.context.font = this.fontSize + "px 'PressStart2P'";
    this.context.fillText('WINNER', 50, this.height * 0.1);
    this.context.fillText('LOSER', this.width / 2 + 50, this.height * 0.1);
    if (this.gameData?.players[0].score! > this.gameData?.players[1].score!) {
      this.context.fillText(
        String(this.gameData?.players[0].pseudo),
        50,
        this.height * 0.2
      );
      this.context.fillText(
        String(this.gameData?.players[1].pseudo),
        this.width / 2 + 50,
        this.height * 0.2
      );
    } else {
      this.context.fillText(
        String(this.gameData?.players[1].pseudo),
        50,
        this.height * 0.2
      );
      this.context.fillText(
        String(this.gameData?.players[0].pseudo),
        this.width / 2 + 50,
        this.height * 0.2
      );
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
    this.searchingGame = false;
    this.gameData.isOver = true;
    this.gameService.exitRoom();
    this.privateGameInvit = false;
    this.dataService.setPrivateGameInvit(false);
    clearInterval(this.movePlayerInterval);
    this.stopAnimationFrame();
    this.drawEndGame();
    setTimeout(() => {
      this.gameData.players.splice(0, 2);
      this.gameService.updateMyStatus(this.login!, 'ONLINE');
    }, 1000);
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
    if (
      event.target.innerWidth < 500 ||
      event.target.innerHeight < 250
    )
      return;

    this.widthPercent =
      (event.target.innerWidth * this.widthDiff) / this.widthInit;
    this.heightPercent =
      (event.target.innerHeight * this.heightDiff) / this.heightInit;
    this.width = this.widthInit * this.widthPercent;
    this.height = this.heightInit * this.heightPercent;
    if (!this.inGame && !this.searchingGame) {
      this.context.fillStyle = 'black';
      this.context.fillRect(0, 0, this.width, this.height)
    }
  }

  enterQueueCustom() {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.drawImage(this.imgNinho, 0, 0, this.width, this.height);
    this.searchingGame = true;
    this.gameData.inProgress = true;
    this.gameData.isOver = false;
    this.gameService.enterQueue('custom');
    this.startTimer();
    this.startGame();
  }
}
