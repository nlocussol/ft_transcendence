import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import * as bcrypt from 'bcryptjs';
import { Router, RouterOutlet } from '@angular/router';
import { Friend, JoinLeaveRoom, MemberStatus, NewRoom, Room, Message, UserData, RoomMessage } from './interfaces/interfaces';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent {
  muteTime: string = "10";
  members!: MemberStatus[];
  memberOption!: string;
  memberOptions: string[] ;
  selectedMember!: MemberStatus;
  friendsToInvite!: Friend[];
  friendInviteRoom!: string;
  selectedStatus!: string;
  selectedOption!: string;
  options!: string[];
  pseudo: string;
  userStatus!: string;
  roomStatus: string;
  rooms!: Room[];
  roomName!: string;
  roomPassword!: string;
  selectedRoom!: Room | null;
  selectedRoomPwd!: string;
  newPwd!: string;
  conversation!: Message[];
  newMessage!: string;
  roomSearch!: string;
  allRoomChecked: boolean;
  socket: Socket;
  joined: boolean;

  constructor(private http: HttpClient, private dataServices : DataService, private router: Router) {
    this.memberOptions = ['watch profil', '1v1 match', 'Friend Invite'];
    this.joined = false;
    this.allRoomChecked = false;
    this.roomStatus = 'PROTECTED';
    this.socket = io(environment.SOCKET_ENDPOINT);
    this.pseudo = this.dataServices.getLogin();
    if (!this.pseudo)
      return;
    this.onCheckboxChange()
    this.getNewRoom();
    this.receiveMessage();
    this.getNewMember();
  }

  getNewMember() {
    this.socket.on('join-room', (data: JoinLeaveRoom) => {
      if (this.selectedRoom?.name === data.name)
        this.members.push({pseudo: data.pseudo, status: 'NORMAL'})
      if (this.selectedRoom && data.name === this.selectedRoom.name && this.selectedRoom.ban
        && !this.selectedRoom.ban.find((ban: any) => ban.pseudo === data.pseudo))
        this.selectedRoom.messages.push({content: `${data.pseudo} as joined the room!`, sender: 'BOT'})
        this.conversation = this.selectedRoom?.messages as Message[]
      })
  }

   getNewRoom() {
      this.socket.on('all-room', async (data: NewRoom) => {
        if (this.allRoomChecked || data.owner === this.pseudo) {
          const room: Room = await this.http.get(`http://localhost:3000/db-writer-room/data-room/${data.name}`).toPromise() as Room
          this.rooms.push(room);
        }
      })

      this.socket.on('has-leave-room', (data: JoinLeaveRoom) => {
        if (this.selectedRoom?.name === data.name)
          this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.pseudo === data.pseudo), 1)
        if (data.pseudo === this.pseudo && !this.allRoomChecked) {
          this.rooms.splice(this.rooms.findIndex((room: Room) => room.name === data.name), 1)
          this.joined = false;
          this.selectedRoom = null;
        }
        if (this.allRoomChecked && this.selectedRoom?.name === data.name && data.pseudo === this.pseudo) {
          this.joined = false;
          this.selectedRoom = null;
        }
      })
  }

  onMemberClick(member: MemberStatus) {
    this.selectedMember = member;
  }

  newRoomPwd() {
    if (this.newPwd === '')
      return ;
    const body = {
      name: this.selectedRoom?.name,
      status: this.selectedStatus,
      pwd: this.newPwd,
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer-room/change-status/', body, { headers }).subscribe()
    this.selectedStatus = '';
    this.newPwd = '';
  }

  async handleMemberOption(memberOption: string, member: MemberStatus) {
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    switch (memberOption) {
      case 'watch profil':
        this.router.navigateByUrl(`/user-page/${member.pseudo}`);
        break ;

      case '1v1 match':
        const bodyInviteMatch = {
          friend: member.pseudo,
          pseudo: this.pseudo,
          content: `${this.pseudo} challenges you to a pong duel!`,
          type: 'REQUEST_MATCH'
        }
        this.socket.emit('send-notif', bodyInviteMatch);
        break ;

      case 'Friend Invite':
        const bodyInvite = {
          friend: member.pseudo,
          pseudo: this.pseudo,
          content: `${this.pseudo} want to be your friend!`,
          type: 'REQUEST_FRIEND'
        }
        const profileData: UserData = await this.http.get(`http://localhost:3000/db-writer/data/${this.pseudo}`).toPromise() as UserData
        if (profileData.friends.find((friend: Friend) => friend.name === bodyInvite.pseudo)) {
          console.log(bodyInvite.friend, 'is already your friend!');
          return ;
        }
        this.socket.emit('send-notif', bodyInvite);
        break ;

      case 'Promote':
        console.log(member.pseudo);
        const bodyPromote = {
          name: this.selectedRoom?.name,
          pseudo: member.pseudo,
          status: 'ADMIN'
        }    
        this.http.post('http://localhost:3000/db-writer-room/change-member-status/', bodyPromote, { headers }).subscribe()
        break ;

      case 'Downgrade':
        const bodyDowngrade = {
          name: this.selectedRoom?.name,
          pseudo: member.pseudo,
          status: 'NORMAL'
        }    
        this.http.post('http://localhost:3000/db-writer-room/change-member-status/', bodyDowngrade, { headers }).subscribe()
        break ;

      case 'Mute':
        const muteInSecond = Number(this.muteTime)
        if (muteInSecond < 0) {
          console.log("Mute time can't be negative!");
          return ;
        }
        const bodyMute = { 
          name: this.selectedRoom?.name,
          pseudo: member.pseudo,
          time: muteInSecond,
        }
        console.log(muteInSecond);
        this.http.post(`http://localhost:3000/db-writer-room/mute-member/`, bodyMute, { headers }).subscribe()
        break ;

      case 'Kick':
        const bodyKick = { 
          name: this.selectedRoom?.name,
          pseudo: member.pseudo
        }
        this.socket.emit('leave-room', bodyKick)
        this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.pseudo === member.pseudo), 1)
        break ;

      case 'Ban':
        const bodyBan = {
          pseudo: this.pseudo,
          askBanMember: member.pseudo
        }
        this.http.post(`http://localhost:3000/db-writer-room/ban-member/`, bodyBan, { headers }).subscribe()
        this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.pseudo === member.pseudo), 1)
        break ;
    }
  }

  quitRoom() {
    const body = {
      name: this.selectedRoom?.name,
      pseudo: this.pseudo,
    }    
    this.socket.emit('leave-room', body)
    if (!this.allRoomChecked)
      this.rooms.splice(this.rooms.findIndex((room: Room) => room === this.selectedRoom), 1)
    this.joined = false;
    this.selectedRoom = null;
  }

  async submitRoom() {
    if (!this.roomName)
      return ;
    let roomStatus = "PUBLIC"
    if (this.roomPassword && this.roomPassword !== "")
      roomStatus = "PROTECTED"
    const body = {
      name: this.roomName,
      owner: this.pseudo,
      // pwd: bcrypt.hashSync(this.roomPassword, "Bonjour"),
      pwd: this.roomPassword,
      status: roomStatus
    }
    this.socket.emit('create-room', body);
    this.roomName = ''
    this.roomPassword = ''
  }

  sendInviteRoom(userToAddRoom: string) {
    const body = {
      name: this.selectedRoom?.name,
      friend: userToAddRoom,
      content: `${this.pseudo} has invited you to join the ${this.selectedRoom?.name} room!`,
      type: "ROOM_INVITE"
    }
    this.socket.emit('send-notif', body);
  }

  async onClickRoom(room: Room) {
    this.newPwd = '';
    this.selectedStatus = '';
    this.options = ['PUBLIC', 'PROTECTED', 'PRIVATE'];
    this.memberOptions = ['watch profil', '1v1 match', 'Friend Invite'];
    this.joined = false;
    const roomData: Room = await this.http.get(`http://localhost:3000/db-writer-room/data-room/${room.name}`).toPromise() as Room
    this.friendsToInvite = await this.http.get(`http://localhost:3000/db-writer/friends/${this.pseudo}`).toPromise() as Friend[]
    this.selectedRoom = room;
    this.members = roomData.members;
    this.roomStatus = this.selectedRoom?.status as string;
    this.options.splice(this.options.findIndex(opt => opt === this.roomStatus), 1)
    if (roomData.members && roomData.members.find((member: MemberStatus) => this.pseudo === member.pseudo)) {
      this.joined = true;
      this.roomStatus = "PUBLIC"
      const findMember = roomData.members.find((member: MemberStatus) => this.pseudo === member.pseudo)
      if (findMember)
        this.userStatus = findMember.status
      if (this.selectedRoom?.owner === this.pseudo)
        this.memberOptions = this.memberOptions.concat(['Promote', 'Downgrade', 'Mute', 'Kick', 'Ban'])
      else if (this.userStatus === 'ADMIN')
        this.memberOptions = this.memberOptions.concat(['Promote', 'Mute', 'Kick', 'Ban'])
    }
    this.conversation = this.selectedRoom?.messages as Message[];
  }

  onStatusSelected(event: Event) {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    if (this.selectedRoom)
      this.selectedRoom.status = this.selectedStatus;
    console.log(this.selectedStatus);
    if (this.selectedStatus === 'PROTECTED')
      return ;
    const body = {
      name: this.selectedRoom?.name,
      status: this.selectedStatus,
    }    
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer-room/change-status/', body, { headers }).subscribe()
  }

  receiveMessage() {
    this.socket.on('receive-room-msg', (data: RoomMessage) => this.conversation.push(data))
  }

  joinRoom() {
    if (this.selectedRoom) {
      this.joined = true;
      const body: JoinLeaveRoom = {
        pseudo: this.pseudo,
        name: this.selectedRoom?.name,
      }    
      this.socket.emit('request-join-room', body)
    }
  }

  async sendMessage(message: string) {
    if (this.selectedRoom) {
      const body: RoomMessage = {
        sender: this.pseudo,
        name: this.selectedRoom.name,
        content: message,
      }  
      this.socket.emit('add-room-msg', body);
      this.newMessage = '';
    } 
  }

  async onCheckboxChange() {
    this.selectedRoom = null;
    if (this.allRoomChecked)
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/all-room/`).toPromise() as Room[]
    else
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/all-room/${this.pseudo}`).toPromise() as Room[]
  }

  async findRoom(roomName: string) {
    this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/search-room/${roomName}`).toPromise() as Room[]
  }

  verifyRoomPwd() {
    if (this.selectedRoom?.pwd === this.selectedRoomPwd)
      this.roomStatus = 'PUBLIC'
    this.selectedRoomPwd = ''
  }
}
