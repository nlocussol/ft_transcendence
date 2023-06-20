import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io'
import { GameService } from './game.service';
import { GameData, side } from './models/game.models';

const SERVER_TICK = 15;

@WebSocketGateway({
  cors: true,
  namespace: 'game/inprogress'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  io: Namespace;
  socket: Socket;

  constructor(private gameService: GameService) {}

  afterInit(server: any) {
    this.io.on('connection', (socket) => {

      socket.on('keydown', (payload) => {
        if (payload.UUID == this.gameService.getGameImProgress().players[0].UUID) {
          this.gameService.movePlayer(0, payload.isMovingUp, payload.isMovingDown);
        } else if (payload.UUID == this.gameService.getGameImProgress().players[1].UUID) {
          this.gameService.movePlayer(1, payload.isMovingUp, payload.isMovingDown);
        }
      })

    })
    setInterval(this.updatePlayers, SERVER_TICK);
  }

  handleConnection(socket: Socket) {
  }

  handleDisconnect(client: Socket) {
    // Need to remove player if in queue
  }

  updateGame() {

  }

  // Payload is playerUUID
  @SubscribeMessage('joinGameRoom')
  joinGameRoom(client: Socket, payload: string) {
    console.log(payload)
    console.log("Player joined room");
    for (let gameId in this.gameService.gameInProgress) {
      if (this.gameService.gameInProgress[gameId].players[0] && this.gameService.gameInProgress[gameId].players[0].UUID == payload ||
        this.gameService.gameInProgress[gameId].players[1] && this.gameService.gameInProgress[gameId].players[1].UUID == payload) {
          console.log("Already in game")
          continue;
        }
      if (this.gameService.gameInProgress[gameId].players[0] === undefined) {
        this.gameService.gameInProgress[gameId].matchUUID = crypto.randomUUID();
        this.gameService.gameInProgress[gameId].players[0] = this.gameService.newPlayer(side.LEFT, payload);
        console.log("Found one player")
      } else if (this.gameService.gameInProgress[gameId].players[1] === undefined) {
        this.gameService.gameInProgress[gameId].players[1] = this.gameService.newPlayer(side.RIGHT, payload);
        console.log("Found second player, starting game")
        this.gameService.startGame(this.gameService.gameInProgress[gameId].matchUUID);
      } else {
        console.log("Creating new game")
        this.gameService.gameInProgress.push(new GameData());
      }
    }
  }

  updatePlayers = (client: Socket, payload: GameData) => {
    this.io.emit('updatePlayers', this.gameService.getGameImProgress());
  }
}
