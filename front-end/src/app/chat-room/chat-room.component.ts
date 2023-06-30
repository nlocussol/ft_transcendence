import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../services/data.service';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Router } from '@angular/router';
import { Friend, JoinLeaveRoom, MemberStatus, NewRoom, Room, Message, UserData, RoomMessage, Passwords } from './interfaces/interfaces';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  friends!: Friend[];
  muteTime: string = "10";
  members!: MemberStatus[];
  memberOption!: string;
  memberOptions!: string[] ;
  selectedMember!: MemberStatus;
  friendsToInvite!: Friend[];
  friendInviteRoom!: string;
  selectedStatus!: string;
  selectedOption!: string;
  options!: string[];
  login!: string;
  pseudo!: string;
  userStatus!: string;
  roomStatus!: string;
  rooms!: Room[];
  roomName!: string;
  roomPassword!: string;
  selectedRoom!: Room | null;
  selectedRoomPwd!: string;
  newPwd!: string;
  conversation!: Message[];
  newMessage!: string;
  roomSearch!: string;
  allRoomChecked!: boolean;
  socket!: Socket;
  joined!: boolean;

  ngOnInit(): void {
    this.homeService.getUser().subscribe(res => {
      this.memberOptions = ['watch profil', '1v1 match', 'Friend Invite'];
      this.joined = false;
      this.allRoomChecked = false;
      this.roomStatus = 'PROTECTED';
      this.socket = io(environment.SOCKET_ENDPOINT);
      this.login = res.login;
      this.pseudo = res.pseudo;
      this.onCheckboxChange()
      this.getNewRoom();
      this.receiveMessage();
      this.getNewMember();
      this.http.get(`http://localhost:3000/db-writer/friends/${this.login}`).subscribe((res: any) => this.friends = res)
    })
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
  }

  constructor(private http: HttpClient, private homeService: HomeService, private router: Router) {}

  getNewMember() {
    this.socket.on('join-room', (data: JoinLeaveRoom) => {
      if (this.selectedRoom?.name === data.name)
        this.members.push({pseudo: data.pseudo, login: data.login, status: 'NORMAL'})
      if (this.selectedRoom && data.name === this.selectedRoom.name && this.selectedRoom.ban
        && !this.selectedRoom.ban.find((ban: any) => ban.login === data.login))
        this.conversation = this.selectedRoom?.messages as Message[]
      })
  }

  isBlocked(member: string) {
    if (member === this.pseudo)
      return false
    let friend: Friend | undefined = this.friends.find(friend => friend.name === member)
    if (friend)
      return friend.blocked
    return false
  }

  isBan() {
    if (this.selectedRoom?.ban.find(banMember => banMember === this.login))
      return true;
    return false
  }

   getNewRoom() {
      this.socket.on('all-room', async (data: NewRoom) => {
        if (this.allRoomChecked || data.owner === this.login) {
          const room: Room = await this.http.get(`http://localhost:3000/db-writer-room/data-room/${data.name}`).toPromise() as Room
          this.rooms.push(room);
        }
      })

      this.socket.on('has-leave-room', (data: JoinLeaveRoom) => {
        if (this.selectedRoom?.name === data.name)
          this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.login === data.login), 1)
        if (data.login === this.login && !this.allRoomChecked) {
          this.rooms.splice(this.rooms.findIndex((room: Room) => room.name === data.name), 1)
          this.joined = false;
          this.selectedRoom = null;
        }
        if (this.allRoomChecked && this.selectedRoom?.name === data.name && data.login === this.login) {
          this.joined = false;
          this.selectedRoom = null;
        }
      })

      this.socket.on('ban-member-room', (data: JoinLeaveRoom) => {
        if (this.selectedRoom?.name === data.name)
          this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.login === data.login), 1)
        if (data.login === this.login && !this.allRoomChecked) {
          this.rooms.find(room => {
            if (room.name === data.name)
              room.ban.push(data.login)
          })
          this.rooms.splice(this.rooms.findIndex((room: Room) => room.name === data.name), 1)
          this.joined = false;
          this.selectedRoom = null;
        }
        if (this.allRoomChecked && this.selectedRoom?.name === data.name && data.login === this.login) {
          this.rooms.find(room => {
            if (room.name === data.name)
              room.ban.push(data.login)
          })
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
        this.router.navigateByUrl(`/user-page/${member.login}`);
        break ;

      case '1v1 match':
        const bodyInviteMatch = {
          friend: member.login,
          login: this.login,
          content: `${this.pseudo} challenges you to a pong duel!`,
          type: 'REQUEST_MATCH'
        }
        this.socket.emit('send-notif', bodyInviteMatch);
        break ;

      case 'Friend Invite':
        const bodyInvite = {
          friend: member.login,
          login: this.login,
          content: `${this.login} want to be your friend!`,
          type: 'REQUEST_FRIEND'
        }
        const profileData: UserData = await this.http.get(`http://localhost:3000/db-writer/data/${this.login}`).toPromise() as UserData
        if (profileData.friends.find((friend: Friend) => friend.name === bodyInvite.login)) {
          console.log(bodyInvite.friend, 'is already your friend!');
          return ;
        }
        this.socket.emit('send-notif', bodyInvite);
        break ;

      case 'Promote':
        console.log(member.login);
        const bodyPromote = {
          name: this.selectedRoom?.name,
          login: member.login,
          status: 'ADMIN'
        }    
        this.http.post('http://localhost:3000/db-writer-room/change-member-status/', bodyPromote, { headers }).subscribe()
        break ;

      case 'Downgrade':
        const bodyDowngrade = {
          name: this.selectedRoom?.name,
          login: member.login,
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
          login: member.login,
          time: muteInSecond,
        }
        console.log(muteInSecond);
        // this.http.post(`http://localhost:3000/db-writer-room/mute-member/`, bodyMute, { headers }).subscribe()
        this.socket.emit('mute-member', bodyMute)
        break ;

      case 'Kick':
        const bodyKick = { 
          name: this.selectedRoom?.name,
          login: member.login
        }
        this.socket.emit('leave-room', bodyKick)
        this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.login === member.login), 1)
        break ;

      case 'Ban':
        const bodyBan = {
          name: this.selectedRoom?.name,
          login: member.login,
          askBanLogin: this.login
        }
        this.socket.emit('ban-member', bodyBan)
        this.members.splice(this.members.findIndex((roomMember: MemberStatus) => roomMember.login === member.login), 1)
        break ;
    }
  }

  quitRoom() {
    const body = {
      name: this.selectedRoom?.name,
      login: this.login,
    }    
    this.socket.emit('leave-room', body)
    if (!this.allRoomChecked)
      this.rooms.splice(this.rooms.findIndex((room: Room) => room === this.selectedRoom), 1)
    if (this.selectedRoom) {
      const bodyMessage: RoomMessage = {
        sender: 'BOT',
        name: this.selectedRoom.name,
        content: `${this.pseudo} has leave the room!`,
      }  
      this.socket.emit('add-room-msg', bodyMessage);
    }
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
      ownerPseudo: this.pseudo,
      owner: this.login,
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
      content: `${this.login} has invited you to join the ${this.selectedRoom?.name} room!`,
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
    this.friendsToInvite = await this.http.get(`http://localhost:3000/db-writer/friends/${this.login}`).toPromise() as Friend[]
    this.selectedRoom = room;
    this.members = roomData.members;
    this.roomStatus = this.selectedRoom?.status as string;
    this.options.splice(this.options.findIndex(opt => opt === this.roomStatus), 1)
    if (roomData.members && roomData.members.find((member: MemberStatus) => this.login === member.login)) {
      this.joined = true;
      this.roomStatus = "PUBLIC"
      const findMember = roomData.members.find((member: MemberStatus) => this.login === member.login)
      if (findMember)
        this.userStatus = findMember.status
      if (this.selectedRoom?.owner === this.login)
        this.memberOptions = this.memberOptions.concat(['Promote', 'Downgrade', 'Mute', 'Kick', 'Ban'])
      else if (this.userStatus === 'ADMIN')
        this.memberOptions = this.memberOptions.concat(['Promote', 'Mute', 'Kick', 'Ban'])
    }
    this.conversation = this.selectedRoom?.messages as Message[];
  }

  onStatusSelected(event: Event) {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.options = ['PUBLIC', 'PROTECTED', 'PRIVATE'];
    this.options.splice(this.options.findIndex(opt => opt === this.selectedStatus), 1)
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
        pseudo: this.login,
        login: this.login,
        name: this.selectedRoom?.name,
      }    
      this.socket.emit('request-join-room', body)
      if (this.selectedRoom) {
        const bodyMessage: RoomMessage = {
          sender: 'BOT',
          name: this.selectedRoom.name,
          content: `${this.pseudo} has join the room!`,
        }  
        this.socket.emit('add-room-msg', bodyMessage);
      }
    }
  }

  async sendMessage(message: string) {
    if (this.selectedRoom) {
      const body: RoomMessage = {
        sender: this.login,
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
      this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/all-room/${this.login}`).toPromise() as Room[]
  }

  async findRoom(roomName: string) {
    this.rooms = await this.http.get(`http://localhost:3000/db-writer-room/search-room/${roomName}`).toPromise() as Room[]
  }

  async verifyRoomPwd() {
    if (this.selectedRoom == undefined)
      return ;
    const body: Passwords = {
      roomPassword: this.selectedRoom.pwd,
      inputPassword: this.selectedRoomPwd,
    }
    const headers = new HttpHeaders().set('Content-type', `application/json; charset=UTF-8`)
    this.http.post('http://localhost:3000/db-writer-room/check-password/', body, { headers }).subscribe((res) => {
      if (res == true){
        this.roomStatus = 'PUBLIC'
      this.selectedRoomPwd = ''
      }
    })
  }
}
