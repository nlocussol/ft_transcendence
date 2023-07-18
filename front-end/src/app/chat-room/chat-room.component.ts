import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environment';
import { Router } from '@angular/router';
import { Friend, JoinLeaveRoom, MemberStatus, NewRoom, Room, Message, UserData, RoomMessage, Passwords } from './interfaces/interfaces';
import { HomeService } from '../home/service/home.service';
import { Emitters } from '../emitters/emitters';
import { ChatRoomService } from './chat-room.service';
import { ProfileService } from '../profile/profile.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  friends!: Friend[];
  muteTime!: string;
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
      this.onSocket();
      this.receiveMessage();
      this.getNewMember();
      this.profileService.getUserFriends(this.login).subscribe((friends: Friend[]) => this.friends = friends)
    })
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
  }

  constructor(private homeService: HomeService, private router: Router, private roomService: ChatRoomService, private profileService: ProfileService) {}

  getNewMember() {
    this.socket.on('join-room', (data: JoinLeaveRoom) => {
      if (this.selectedRoom?.name === data.name) {
        this.profileService.getProfileData(data.login).subscribe((newMemberData: UserData) => {
          this.members.push({pseudo: newMemberData.pseudo, login: data.login, status: 'NORMAL'})
          this.selectedRoom?.members.push({pseudo: newMemberData.pseudo, login: data.login, status: 'NORMAL'})
        })
      }
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

   onSocket() {
      this.socket.on('all-room', async (data: NewRoom) => {
        if (this.allRoomChecked || data.owner === this.login)
          this.roomService.getRoomData(data.name).subscribe((roomData: Room) => this.rooms.push(roomData))
      })

      this.socket.on('has-leave-room', (data: JoinLeaveRoom) => {
        const ownerOfRoom: number = this.rooms.findIndex(room => room.owner === data.login)
        if (ownerOfRoom >= 0) {
          this.rooms.splice(ownerOfRoom, 1)
          this.joined = false;
          this.selectedRoom = null;
          return ;
        }
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

      this.socket.on('room-status-changed', (data: any) => {
        if (this.selectedRoom && this.selectedRoom.name === data.name) {
          this.selectedRoom.status = data.status
          if (this.roomStatus != 'PUBLIC')
            this.roomStatus = data.status
        }
        let room = this.rooms.findIndex(room => room.name === data.name)
        this.rooms[room].status = data.status
      })

      this.socket.on('user-room-status-changed',(data: any) => {
        if (data.login === this.login)
          this.userStatus = data.status
        const memberIndex = this.members.findIndex(member => member.login === data.login)
        if (memberIndex >= 0)
          this.members[memberIndex].status = data.status
      })
  }

  onMemberClick(member: MemberStatus) {
    if (member.login === this.selectedRoom?.owner)
      this.memberOptions = ['watch profil', '1v1 match', 'Friend Invite'];
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
    this.socket.emit('room-change-status', body)
    this.selectedStatus = '';
    this.newPwd = '';
  }

  async handleMemberOption(memberOption: string, member: MemberStatus) {
    switch (memberOption) {
      case 'watch profil':
        this.router.navigateByUrl(`/user-page/${member.login}`);
        break ;

      case '1v1 match':
        console.log(member.login);
        const bodyInviteMatch = {
          friend: member.login,
          login: this.login,
          content: `${this.pseudo} challenges you to a pong duel!`,
          type: 'REQUEST_MATCH'
        }
        this.socket.emit('send-notif', bodyInviteMatch);
        this.router.navigate(['/game']);
        break ;
      case 'Friend Invite':
        const bodyInvite = {
          friend: member.login,
          login: this.login,
          content: `${this.login} want to be your friend!`,
          type: 'REQUEST_FRIEND'
        }
        this.profileService.getProfileData(this.login).subscribe((profileData: UserData) => {
          if (profileData.friends.find((friend: Friend) => friend.name === bodyInvite.login)) {
            console.log(bodyInvite.friend, 'is already your friend!');
            return ;
          }
          this.socket.emit('send-notif', bodyInvite);
        })
        break ;

      case 'Promote':
        const bodyPromote = {
          name: this.selectedRoom?.name,
          login: member.login,
          status: 'ADMIN'
        }    
        this.socket.emit('user-room-change-status', bodyPromote)
        break ;

      case 'Downgrade':
        const bodyDowngrade = {
          name: this.selectedRoom?.name,
          login: member.login,
          status: 'NORMAL'
        }    
        this.socket.emit('user-room-change-status', bodyDowngrade)
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
        this.socket.emit('mute-member', bodyMute)
        break ;

      case 'Kick':
        const bodyKick = { 
          name: this.selectedRoom?.name,
          login: member.login
        }
        this.socket.emit('leave-room', bodyKick)
        break ;

      case 'Ban':
        const bodyBan = {
          name: this.selectedRoom?.name,
          login: member.login,
          askBanLogin: this.login
        }
        this.socket.emit('ban-member', bodyBan)
        break ;
    }
  }

  quitRoom() {
    const body = {
      name: this.selectedRoom?.name,
      login: this.login,
    }    
    this.socket.emit('leave-room', body)
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
    if (this.selectedRoom?.members.find(member => member.login === userToAddRoom)) {
      console.log(`${userToAddRoom} is already in the room`);
      return ;
    }
    if (!userToAddRoom)
      return ;
    console.log(this.friendsToInvite);
    const friendPP = this.friendsToInvite.find(friend => friend.name === userToAddRoom)?.pp as string
    const friendLogin = friendPP.substring(0, friendPP.lastIndexOf('.'))
    console.log(friendLogin);
    if (friendLogin) {
      const body = {
        name: this.selectedRoom?.name,
        friend: friendLogin,
        login: this.login,
        content: `${this.pseudo} has invited you to join the ${this.selectedRoom?.name} room!`,
        type: "ROOM_INVITE"
      }
      this.socket.emit('send-notif', body);
    }
  }

  async onClickRoom(room: Room) {
    if (this.selectedRoom)
      this.socket.emit('socket-leave-room', this.selectedRoom.name)
    this.newPwd = '';
    this.selectedStatus = '';
    this.options = ['PUBLIC', 'PROTECTED', 'PRIVATE'];
    this.memberOptions = ['watch profil', '1v1 match', 'Friend Invite'];
    this.joined = false;

    this.roomService.getRoomData(room.name).subscribe((roomData: Room) => {
      this.profileService.getUserFriends(this.login).subscribe((friends: Friend[]) => {
        for (let i in roomData.members) {
          const friendInRoom = friends.findIndex((friend: Friend) => friend.name === roomData.members[i].login)
          if (friendInRoom >= 0)
            friends.splice(friendInRoom, 1)
        }
        for (let i in friends) {
          if (friends[i].blocked)
            friends.splice(friends.findIndex(friend => friend.name === friends[i].name), 1)
        }
        for (let i in friends)
          this.profileService.getProfileData(friends[i].name).subscribe((friendData: UserData) => friends[i].name = friendData.pseudo)
        this.friendsToInvite = friends;
      })
      this.selectedRoom = room;
      this.socket.emit('socket-join-room', this.selectedRoom.name)
      for (let i in roomData.members)
        this.profileService.getProfileData(roomData.members[i].login).subscribe((memberData: UserData) => roomData.members[i].pseudo = memberData.pseudo)
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
      for (let i in roomData.messages) {
        if (roomData.messages[i].sender != 'BOT') {
          this.profileService.getProfileData(roomData.messages[i].sender).subscribe((newMemberData: UserData) => {
            if (this.selectedRoom)
              roomData.messages[i].pseudo = newMemberData.pseudo
          })
        }
        else if (roomData.messages[i].sender === 'BOT')
          roomData.messages[i].pseudo = 'BOT'
      }
      this.conversation = roomData.messages
    })
  }

  onStatusSelected(event: Event) {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.options = ['PUBLIC', 'PROTECTED', 'PRIVATE'];
    this.options.splice(this.options.findIndex(opt => opt === this.selectedStatus), 1)
    if (this.selectedRoom)
      this.selectedRoom.status = this.selectedStatus;
    if (this.selectedStatus === 'PROTECTED')
      return ;
    const body = {
      name: this.selectedRoom?.name,
      status: this.selectedStatus,
    }    
    this.socket.emit('room-change-status', body)
  }

  receiveMessage() {
    this.socket.on('receive-room-msg', (data: Message) => {
      if (data.sender != 'BOT') {
        this.profileService.getProfileData(data.sender).subscribe((newMemberData: any) => {
          data.sender = newMemberData.pseudo
          data.pseudo = newMemberData.pseudo
          this.conversation.push(data)
        })
      }
      else {
        data.pseudo = 'BOT'
        this.conversation.push(data)
      }
    })
  }

  joinRoom() {
    if (this.selectedRoom && this.selectedRoom.status != 'PRIVATE') {
      this.joined = true;
      const body: JoinLeaveRoom = {
        pseudo: this.pseudo,
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
    if (this.selectedRoom && message && message.length) {
      const body: RoomMessage = {
        sender: this.login,
        name: this.selectedRoom.name,
        content: message,
      }  
      this.socket.emit('add-room-msg', body);
      this.newMessage = '';
    } 
  }

  onCheckboxChange() {
    this.selectedRoom = null;
    if (this.allRoomChecked)
      this.roomService.getAllRoom(null).subscribe((rooms: Room[]) => this.rooms = rooms)
    else
      this.roomService.getAllRoom(this.login).subscribe((rooms: Room[]) => this.rooms = rooms)
  }

  findRoom(roomName: string) {
    this.roomService.searchRoom(roomName).subscribe((rooms: Room[]) => this.rooms = rooms)
  }

  async verifyRoomPwd() {
    if (this.selectedRoom == undefined)
      return ;
    const body: Passwords = {
      roomPassword: this.selectedRoom.pwd,
      inputPassword: this.selectedRoomPwd,
    }
    this.roomService.checkRoomPass(body).subscribe((res) => {
      if (res == true){
        this.roomStatus = 'PUBLIC'
      this.selectedRoomPwd = ''
      }
    })
  }
}
