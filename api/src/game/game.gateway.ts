import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io'
import { GameService } from './game.service';
import { GameData, side } from './models/game.models';
import { OnModuleInit } from '@nestjs/common';

const SERVER_TICK = 15;

@WebSocketGateway({
  cors: true,
  namespace: 'game'
})
export class GameGateway implements OnModuleInit {
  @WebSocketServer()
  io: Namespace;
  socket: Socket;

  constructor(private gameService: GameService) {}

  onModuleInit() {
    let interval = setInterval(() => {
      this.gameService.gameInProgress.forEach((game) => {
        console.log(game.matchUUID);
      })
    }, 100);
  }

  afterInit(server: any) {
    this.io.on('connection', (socket) => {
      // If player try to connect without passing its unique pseudo
      if (socket.handshake.query.pseudo == undefined) {
        socket.disconnect()
      } else {
        var playerMatchUUID = this.gameService.findGameByPlayer(socket.handshake.query.pseudo as string);
        socket.join(playerMatchUUID);
      }
      this.io.to(playerMatchUUID).emit('updatePlayers', "tgfdp")
    });
  }

  @SubscribeMessage('updatePlayers')
  updatePlayers()
  {
    console.log("test")
  }

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

  // // Payload is playerUUID
  // @SubscribeMessage('joinGameRoom')
  // joinGameRoom(client: Socket, payload: string) {
  //   console.log(payload)
  //   console.log("Player joined room");
  //   for (let gameId in this.gameService.gameInProgress) {
  //     if (this.gameService.gameInProgress[gameId].players[0] && this.gameService.gameInProgress[gameId].players[0].pseudo == payload ||
  //       this.gameService.gameInProgress[gameId].players[1] && this.gameService.gameInProgress[gameId].players[1].pseudo == payload) {
  //         console.log("Already in game")
  //         continue;
  //       }
  //     if (this.gameService.gameInProgress[gameId].players[0] === undefined) {
  //       this.gameService.gameInProgress[gameId].matchUUID = crypto.randomUUID();
  //       this.gameService.gameInProgress[gameId].players[0] = this.gameService.newPlayer(side.LEFT, payload);
  //       console.log("Found one player")
  //     } else if (this.gameService.gameInProgress[gameId].players[1] === undefined) {
  //       this.gameService.gameInProgress[gameId].players[1] = this.gameService.newPlayer(side.RIGHT, payload);
  //       console.log("Found second player, starting game")
  //       this.gameService.startGame(this.gameService.gameInProgress[gameId].matchUUID);
  //     } else {
  //       console.log("Creating new game")
  //       this.gameService.gameInProgress.push(new GameData());
  //     }
  //   }
  // }

  // updatePlayers = (client: Socket, payload: GameData) => {
  //   this.io.emit('updatePlayers', this.gameService.getGameImProgress());
  // }
}
