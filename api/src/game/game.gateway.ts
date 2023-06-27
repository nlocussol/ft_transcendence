import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io'
import { GameService } from './game.service';
import { GameData, side } from './models/game.models';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SERVER_TICKRATE } from './environment';

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
        // this.io.to(game.matchUUID).emit('updatePlayers', game)
        this.io.to(game.matchUUID).emit('updatePlayers', game)
        // this.io.to(game.matchUUID)
      })
    }, SERVER_TICKRATE);
  }

  onModuleDestroy() {
    clearInterval(this.intervalId);
  }

  afterInit(server: any) {
    this.io.on('connection', (socket) => {
      // If player try to connect without passing its unique pseudo
      if (socket.handshake.query.pseudo == undefined) {
        socket.disconnect();
      } else {
        var playerMatchUUID = this.gameService.findGameByPlayer(socket.handshake.query.pseudo as string);
        if (!playerMatchUUID) {
          console.log(socket.handshake.query.pseudo + ": Tried to connect withouth being in a room")
          socket.disconnect();
        } else {
            socket.join(playerMatchUUID);
          }
        }
      })
    }

  // @SubscribeMessage('updatePlayers')
  // updatePlayers()
  // {
  // }

  gameLoops() {
  }
      // socket.on('keydown', (payload) => {
      //   if (payload.UUID == this.gameService.getGameImProgress().players[0].pseudo) {
      //     this.gameService.movePlayer(0, payload.isMovingUp, payload.isMovingDown);
      //   } else if (payload.UUID == this.gameService.getGameImProgress().players[1].pseudo) {
      //     this.gameService.movePlayer(1, payload.isMovingUp, payload.isMovingDown);
      //   }
      // })

  //   })
  //   setInterval(this.updatePlayers, SERVER_TICK);
  // }

  // handleConnection(socket: Socket) {
    // console.log(this.io)
  // }

  // handleDisconnect(client: Socket) {
  //   // Need to remove player if in queue
  // }

  // updateGame() {

  // }

  //   }
  // }

  // updatePlayers = (client: Socket, payload: GameData) => {
  //   this.io.emit('updatePlayers', this.gameService.getGameImProgress());
  // }
}
