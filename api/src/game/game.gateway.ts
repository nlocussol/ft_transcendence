import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameService } from './game.service';
import { GameData, side } from './models/game.models';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { environment } from './environment';

class Client {
  id: string;
  login: string;
  room: string;
  state: string;
  socket: Socket;
}

@WebSocketGateway({
  cors: true,
  namespace: 'game',
})
export class GameGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  io: Namespace;
  sockets: Socket[] = [];
  intervalId: any;
  clientQueue: Client[] = [];
  clients: Client[] = [];

  constructor(private gameService: GameService) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      this.gameService.gameInProgress.forEach((game) => {
        delete game.intervalID;
        this.io.to(game.matchUUID).emit('updatePlayers', game);
      });
    }, environment.TICKRATE);
  }

  onModuleDestroy() {
    clearInterval(this.intervalId);
  }

  afterInit(server: any) {
    this.io.on('connection', (socket) => {
      if (socket.handshake.auth.login == undefined) {
        socket.disconnect();
      }
      this.handleSocketConnection(socket);
      // else {
      //   var gameUUID = this.gameService.findGameByPlayer(socket.handshake.query.login as string);
      //   if (!gameUUID) {
      //     console.log(socket.handshake.query.login + ": Tried to connect without being in a room")
      //     socket.disconnect();
      //   } else {
      //       socket.join(gameUUID);
      //       this.gameService.handleReconnexion(socket.handshake.query.login as string, gameUUID);
      //     }

      socket.on('disconnect', () => {
        console.log('Disconnect from socket: ', socket.handshake.auth.login);
        const client = this.clients.find((client) => client.id == socket.id);
        this.removePlayerFromQueue(client);
        // this.removePlayerFromQueue(socket.handshake.query.login as string);
        this.gameService.handleDeconnexion(
          socket.handshake.auth.login as string,
        );
      });
    });
  }

  handleSocketConnection(socket: Socket) {
    this.sockets.push(socket);
    if (
      this.clients.find(
        (client) => client.login == socket.handshake.auth.login,
      ) == undefined
    ) {
      console.log('Connection: ', socket.handshake.auth.login);
      let client = new Client();
      client.login = socket.handshake.auth.login as string;
      client.id = socket.id;
      client.state = 'idle';
      client.socket = socket;
      this.clients.push(client);
    } else {
      console.log('Reconnection: ', socket.handshake.auth.login);
      let client = this.clients.find(
        (client) => client.login == socket.handshake.auth.login,
      );
      client.id = socket.id;
      client.socket = socket;
    }
  }

  addPlayerToQueue(client: Client) {
    if (this.clientQueue.find((c) => c.login == client.login) == undefined) {
      client.state = 'queueing';
      this.clientQueue.push(client);
    }
  }

  removePlayerFromQueue(client: Client) {
    const clientIndex = this.clientQueue.indexOf(client, 0);
    if (clientIndex < 0) {
      return;
    }
    this.clientQueue.splice(clientIndex, 0);
  }

  addPlayersToRoom() {
    console.log('Creating a game...');
    const game: GameData = this.gameService.createNewGame();

    let client: Client = this.clientQueue.shift();
    client.room = game.matchUUID;
    game.players[0].login = client.login;
    client.socket.join(game.matchUUID);

    client = this.clientQueue.shift();
    client.room = game.matchUUID;
    game.players[1].login = client.login;
    client.socket.join(game.matchUUID);
  }

  @SubscribeMessage('queue')
  handleQueue(socket: Socket) {
    console.log('Wants to join a game:', socket.handshake.auth.login);
    let client = this.clients.find((c) => c.socket.id == socket.id);
    if (client == undefined) {
      console.log('GameGatewayHandleQueue: problem');
      return;
    }
    this.addPlayerToQueue(client);
    if (this.clientQueue.length >= 2) {
      this.addPlayersToRoom();
    }
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(socket: Socket) {
    let client = this.clients.find((c) => c.socket.id == socket.id);
    if (client == undefined) {
      console.log('GameGatewayRemoveFromQueue: problem');
    }
    this.removePlayerFromQueue(client);
  }

  @SubscribeMessage('leaveRoom')
  removePlayerFromRoom(socket: Socket) {
    console.log('Want to leave the room: ', socket.handshake.auth.login);
    const client = this.clients.find((client) => (client.id = socket.id));
    client.socket.leave(client.room);
  }

  // Payload is login and isMovingUp/Down
  @SubscribeMessage('updatePlayers')
  updatePlayers(client: Socket, payload: any) {
    const playerName = payload.login;
    const playerMovingUp = payload.isMovingUp;
    const playerMovingDown = payload.isMovingDown;
    this.gameService.gameInProgress.forEach((game) => {
      if (game.players[0].login == playerName) {
        this.gameService.movePlayer(game, 0, playerMovingUp, playerMovingDown);
      } else if (game.players[1].login == playerName) {
        this.gameService.movePlayer(game, 1, playerMovingUp, playerMovingDown);
      }
    });
  }
}
