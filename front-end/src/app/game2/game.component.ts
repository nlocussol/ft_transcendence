import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

import { MatchData, movement } from '../interface';
import { GameService2 } from './service/game.service';
import { PlayerData } from './models/player-data.model';

@Component({
  selector: 'app-game',
  styles: ['canvas {border-style:solid}'],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent2 implements OnInit {
  @ViewChild('canvas', { static: true }) myCanvas!: ElementRef;
  gameBoard = document.querySelector('#gameBoard') as HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  scoreText = document.querySelector('#scoreText');
  stopBtn = document.querySelector('#stopBtn');
  searchBtn = document.querySelector('#searchBtn');
  width: number = 500;
  height: number = 700;
  boardBackGround: string = 'rgb(187, 230, 228)';
  paddle1Color: string = 'rgb(8, 75, 131)';
  paddle2Color: string = 'rgb(8, 75, 131)';
  paddleBorder: string = 'black';
  ballColor: string = 'rgb(255, 102, 179)';
  ballBorderColor: string = 'black';
  paddleSpeed: number = 50;
  playerUUID: string = crypto.randomUUID();
  canvas!: HTMLCanvasElement;
  API_IP: string = 'localhost';
  intervalID: any;
  side!: number;
  matchData!: MatchData;
  isMoving: boolean[] = [false, false];
  playerData: PlayerData = new PlayerData();

  constructor(private gameService: GameService2) {
    this.playerData.UUID = crypto.randomUUID();
    this.playerData.searchingGame = false;
  }

  ngOnInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  async searchGame() {
    this.playerData.searchingGame = true;
    this.gameService.sendPlayerData(this.playerData).subscribe();
    // this.sendPlayerData();
    await this.waitMySecond(1000);
    this.gameService.searchOpponent(this.playerData.UUID).subscribe();
    console.log('SEARCH AN OPPONENT !!');
    do {
      this.findOpponent();
      await this.waitMySecond(1000);
    } while (!this.matchData.findOpponent);
    this.side = this.matchData.side;
    console.log('FOUND OPPONENT');
    this.nextTick();
  }

  sendPlayerData() {
    fetch(`http://${this.API_IP}:3000/pong-data/`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },

      body: JSON.stringify({
        playerUUID: this.playerUUID,
        waitingMatch: true,
        gameHeigth: this.height,
        gameWidth: this.width,
      }),
    });
  }

  findOpponent() {
    fetch(`http://${this.API_IP}:3000/pong-data/${this.playerUUID}`)
      .then((reponse) => reponse.json())
      .then((reponseBis) => (this.matchData = reponseBis))
      .catch((error) => console.log(error));
  }

  waitMySecond(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  nextTick() {
    this.intervalID = setTimeout(() => {
      this.getMatch();
      this.clearBoard();
      this.drawPaddles();
      this.drawBall(this.matchData.ballX, this.matchData.ballY);
      this.updateScore();
      this.movePaddle();
      this.nextTick();
    }, 10);
  }

  getMatch() {
    fetch(
      `http://${this.API_IP}:3000/pong-data/match/${this.matchData.matchUUID}`
    )
      .then((reponse) => reponse.json())
      .then((reponseBis) => {
        this.matchData = reponseBis;
      })
      .catch((error) => console.log(error));
  }

  clearBoard() {
    if (this.ctx) this.ctx.fillStyle = this.boardBackGround;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawPaddles() {
    if (this.ctx) {
      this.ctx.strokeStyle = this.paddleBorder;
      this.ctx.fillStyle = this.paddle1Color;
    }
    this.ctx.fillRect(
      this.matchData.paddle1.x,
      this.matchData.paddle1.y,
      this.matchData.paddle1.width,
      this.matchData.paddle1.heigth
    );
    this.ctx.strokeRect(
      this.matchData.paddle1.x,
      this.matchData.paddle1.y,
      this.matchData.paddle1.width,
      this.matchData.paddle1.heigth
    );

    if (this.ctx) this.ctx.fillStyle = this.paddle2Color;
    this.ctx.fillRect(
      this.matchData.paddle2.x,
      this.matchData.paddle2.y,
      this.matchData.paddle2.width,
      this.matchData.paddle2.heigth
    );
    this.ctx.strokeRect(
      this.matchData.paddle2.x,
      this.matchData.paddle2.y,
      this.matchData.paddle2.width,
      this.matchData.paddle2.heigth
    );
  }

  drawBall(ballX: number, ballY: number) {
    if (this.ctx) {
      this.ctx.fillStyle = this.ballColor;
      this.ctx.strokeStyle = this.ballBorderColor;
      this.ctx.lineWidth = 2;
    }
    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, this.matchData.ballRadius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();
  }

  updateScore() {
    if (this.scoreText)
      this.scoreText.textContent = `${this.matchData.player1Score} : ${this.matchData.player2Score}`;
  }

  movePaddle() {
    if (this.isMoving[movement.UP]) {
      if (this.side === 1) {
        this.matchData.paddle1.y -= this.paddleSpeed;
      } else if (this.side === 2) {
        this.matchData.paddle2.y -= this.paddleSpeed;
      }
    }
    if (this.isMoving[movement.DOWN]) {
      if (this.side === 1) {
        this.matchData.paddle1.y += this.paddleSpeed;
      } else if (this.side === 2) {
        this.matchData.paddle2.y += this.paddleSpeed;
      }
    }
    this.updatePaddle();
  }

  updatePaddle() {
    fetch(
      `http://${this.API_IP}:3000/pong-data/match/${this.matchData.matchUUID}`,
      {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },

        body: JSON.stringify(this.matchData),
      }
    );
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
