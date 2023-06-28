import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io'
import { GameService } from './game.service';
import { GameData, side } from './models/game.models';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { environment } from './environment';

@WebSocketGateway({
  cors: true,
  namespace: 'game'
})
export class GameGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  io: Namespace;
  socket: Socket;
  intervalId: any;

  constructor(private gameService: GameService) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      this.gameService.gameInProgress.forEach((game) => {
        delete game.intervalID
        this.io.to(game.matchUUID).emit('updatePlayers', game)
      })
    }, environment.TICKRATE);
  }

  onModuleDestroy() {
    clearInterval(this.intervalId);
  }

  afterInit(server: any) {
    this.io.on('connection', (socket) => {
      // If player try to connect without passing its unique login
      if (socket.handshake.query.login == undefined) {
        socket.disconnect();
      } else {
        var gameUUID = this.gameService.findGameByPlayer(socket.handshake.query.login as string);
        if (!gameUUID) {
          console.log(socket.handshake.query.login + ": Tried to connect withouth being in a room")
          socket.disconnect();
        } else {
            socket.join(gameUUID);
            this.gameService.handleReconnexion(socket.handshake.query.login as string, gameUUID);
          }

          socket.on('disconnect', () => {
            console.log(socket.handshake.query.login);
            this.gameService.handleDeconnexion(socket.handshake.query.login as string, gameUUID);
          })
        }

    });
  }

  // Payload is login and isMovingUp/Down
  @SubscribeMessage('updatePlayers')
  updatePlayers(client: Socket, payload: any) {
    const playerName = payload.login;
    const playerMovingUp = payload.isMovingUp;
    const playerMovingDown = payload.isMovingDown;
    this.gameService.gameInProgress.forEach((game) => {
      if (game.players[0].login == playerName) {
        this.gameService.movePlayer(game, 0, playerMovingUp, playerMovingDown)
      } else if (game.players[1].login == playerName) {
        this.gameService.movePlayer(game, 1, playerMovingUp, playerMovingDown)
      }
    });
  }
}
