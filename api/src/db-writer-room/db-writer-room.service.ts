import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from 'src/typeorm';
import { Passwords, ChangeStatus, member, MuteUser, NewMessage, UserInRoom, UserStatus, BanUser } from 'src/typeorm/room.entity';
import { message } from 'src/typeorm/user.entity';
import { compare, hash } from 'bcrypt';


@Injectable()
export class DbWriterRoomService {
    constructor(
        @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    ){}

    async createRoom(newRoom: any){
        // check if the room doesn't already exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newRoom.name,
         });
         if (currentRoom){
             console.log("The room already exist");
             return null;
         }
 
         // create an instance of room table & fill it
         const room = new Room();
         room.uuid = crypto.randomUUID();
         room.name = newRoom.name;
         room.owner = newRoom.owner;
         if (newRoom.pwd !== null){
            const hashPassword = await hash(newRoom.pwd, 10);
            newRoom.pwd = hashPassword;
         }
         room.pwd = newRoom.pwd;
         room.status = newRoom.status;
         room.members = [];
         room.ban = [];
         room.messages = [];

         // the first user is admin
         const admin: member = {
            login: newRoom.owner,
            status: 'ADMIN',
            mute: 0,
         }
         room.members.push(admin);
         
         // save in database (shared volume)
         await this.roomRepository.save(room)
         return true ;
}

    async getAllRoom(){
        const allRooms = await this.roomRepository.find();
        return allRooms;
    }

    async getAllRoomOfUser(userName: string){
        const allRooms = await this.roomRepository.find();
        const allRoomsCp = await this.roomRepository.find();

        for (var tmp of allRooms){
            if (!tmp.members.find(member => member.login === userName)) {
                allRoomsCp.splice(allRoomsCp.indexOf(tmp), 1);
            }
        }
        return allRoomsCp;
    }

    async dataRoom(roomName: string){
        // check if the room doesn't already exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: roomName,
         });
        if (!currentRoom){
            console.log("The room doesn't exist");
            return null;
        }
        return currentRoom;
    }

    async searchRoom(roomName: string){
        // check if the room doesn't already exist
        const roomList = this.roomRepository
            .createQueryBuilder('room')
            .where('room.name LIKE :keyword', { keyword: `%${roomName}%` })
            .getMany();
         console.log(roomList);

         if (!roomList){
             console.log("The room doesn't exist");
             return null;
         }
        return roomList;
    }

    async addUserToRoom(newUser: UserInRoom){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newUser.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }
         if (currentRoom.members.find(membre => membre.login === newUser.login)){
            console.log("The user already exist.");
            return null;
        }
        if (currentRoom.ban.includes(newUser.login)){
            console.log("The user is in the ban list :(");
            return null;
        }
         // create an instance of membre & push back to the membre list
         const newMembre: member = {
            login: newUser.login,
            status: 'NORMAL',
            mute: 0,
         }
         currentRoom.members.push(newMembre);
 
         // save in database (shared volume)
         await this.roomRepository.save(currentRoom)
         return true ;
}

    async addMessage(newMessage: NewMessage) {
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newMessage.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }
 
         var date=new Date();
         currentRoom.members.find(async member => {
            if (member.login === newMessage.sender
                && member.mute !== 0
                && member.mute > date.getTime()){
                console.log("You are currently muted")
                console.log(`You need to wait ${member.mute} seconds`);
                return null;
            } else if (member.login === newMessage.sender && member.mute !== 0){
                member.mute = 0;
            }
        })
         // create an instance of membre & push back to the membre list
         const message: message = {
            sender: newMessage.sender,
            content: newMessage.content,
         }
         currentRoom.messages.push(message);
 
         // save in database (shared volume)
         await this.roomRepository.save(currentRoom)
         return currentRoom.uuid;
    }

    async changeStatus(newStatus: ChangeStatus){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newStatus.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

         //change room status and chagne pwd if protected
         currentRoom.status = newStatus.status;
         if (currentRoom.status === 'PROTECTED'){
            const hashPassword = await hash(newStatus.pwd, 10);
            currentRoom.pwd = hashPassword;
         }
         else
            currentRoom.pwd = null;
         
         // save in database (shared volume)
        await this.roomRepository.save(currentRoom)
        return true ;
    }

    async leaveRoom(leaveUser: any){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: leaveUser.name,
        });
        if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
        }
        for (var tmp of currentRoom.members){
            if (tmp.login === leaveUser.login){
                if (tmp.login === currentRoom.owner){
                    // this.roomRepository.remove(currentRoom);
                    this.roomRepository.delete(currentRoom.id);
                    console.log("The room owner leave the room, it is therefore destroyed");                  
                }
                currentRoom.members.splice(currentRoom.members.indexOf(tmp, 0), 1);
            }
        }
        await this.roomRepository.save(currentRoom)
        return true ;
    }


    async changeMemberStatus(newMemberStatus: UserStatus){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newMemberStatus.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

        for (let i in currentRoom.members) {
            if (currentRoom.members[i].login === newMemberStatus.login) {
                currentRoom.members[i].status = newMemberStatus.status;
                await this.roomRepository.save(currentRoom)
                return true;
            }
        }   

        console.log("Wrong permisson to user status ");
        return null;
    }

    async banMember(banMember: BanUser){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: banMember.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

        for (let i in currentRoom.members) {
            if (currentRoom.members[i].login === banMember.login && ((currentRoom.members[i].status === 'ADMIN' && banMember.askBanLogin === currentRoom.owner) || (currentRoom.members[i].status !== 'ADMIN'))){
                currentRoom.ban.push(banMember.login);
                this.leaveRoom(banMember);
                await this.roomRepository.save(currentRoom);
                return true;
            } else {
                console.log("Wrong permisson to ban this user");
                return null;
            }
        }
        return null;
    }

    async muteMember(mutedMember: MuteUser){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: mutedMember.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

        var date = new Date();
        for (let i in currentRoom.members) {
            if (currentRoom.members[i].login === mutedMember.login && currentRoom.members[i].status !== 'ADMIN'){
                currentRoom.members[i].mute = date.getTime() + (mutedMember.time * 1000);
                await this.roomRepository.save(currentRoom);
                return true;
            } else {
                console.log("Wrong permisson to mute this user");
                return null;
            }
        }
        console.log("The user doesn't exist");
        return null;
    }

    async checkPassword (pass: Passwords){
        const result = await compare(pass.inputPassword, pass.roomPassword);
        return (result)
    }
}