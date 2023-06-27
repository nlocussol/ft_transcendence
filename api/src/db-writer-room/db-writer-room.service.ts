import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from 'src/typeorm';
import { member } from 'src/typeorm/room.entity';
import { message } from 'src/typeorm/user.entity';

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
         room.pwd = newRoom.pwd;
         room.status = newRoom.status;
         room.members = [];
         room.ban = [];
         room.messages = [];

         // the first user is admin
         const admin: member = {
            pseudo: newRoom.owner,
            status: 'ADMIN',
            mute: 0,
         }
         room.members.push(admin);
         
         // save in database (shared volume)
         await this.roomRepository.save(room)
    }

    async getAllRoom(){
        const allRooms = await this.roomRepository.find();
        return allRooms;
    }

    async getAllRoomOfUser(userName: string){
        const allRooms = await this.roomRepository.find();

        for (var tmp of allRooms){
            if (!tmp.members.find(member => member.pseudo === userName))
                allRooms.splice(allRooms.indexOf(tmp, 0), 1);
        }

        return allRooms;
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

    async addUserToRoom(newUser: any){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newUser.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }
         if (currentRoom.members.find(membre => membre.pseudo === newUser.pseudo)){
            console.log("The user already exist.");
            return null;
        }
        if (currentRoom.ban.includes(newUser.pseudo)){
            console.log("The user is in the ban list :(");
            return null;
        }
         // create an instance of membre & push back to the membre list
         const newMembre: member = {
            pseudo: newUser.pseudo,
            status: 'NORMAL',
            mute: 0,
         }
         currentRoom.members.push(newMembre);
 
         // save in database (shared volume)
         await this.roomRepository.save(currentRoom)
    }

    async addMessage(newMessage: any){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newMessage.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }
 
         currentRoom.members.find(async member => {
            if (member.pseudo === newMessage.sender && member.mute !== 0){
                console.log("You are currently muted")
                console.log(`You need to wait ${member.mute} seconds`);
                return null;
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
    
    async changeRoomName(newName: any){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newName.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }
 
         //check si le user est modo
        currentRoom.members.find(async member => {
            if (member.status === 'ADMIN'){
                currentRoom.name = newName.new;
                await this.roomRepository.save(currentRoom)
                return true;
            } else {
                console.log("Wrong permisson to change room name");
            }
        })
        console.log("Weird problem, \
        can't find the user who change the room name inside the database");
        return null;
    }

    async changeStatus(newStatus: any){
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
         if (currentRoom.status === 'PROTECTED')
            currentRoom.pwd = newStatus.pwd;
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
            if (tmp.pseudo === leaveUser.pseudo){
                if (tmp.pseudo === currentRoom.owner){
                    this.roomRepository.remove(currentRoom);
                    console.log("The room owner leave the room, it is therefore destroyed");                  
                }
                currentRoom.members.splice(currentRoom.members.indexOf(tmp, 0), 1);
            }
        }
        await this.roomRepository.save(currentRoom)
        return true ;
    }


    async changeMemberStatus(newMemberStatus: any){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: newMemberStatus.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

         currentRoom.members.find(async member => {
            if (member.pseudo === newMemberStatus.pseudo && member.status !== 'ADMIN'){
                member.status = newMemberStatus.status;
                await this.roomRepository.save(currentRoom)
                return true;
            } else {
                console.log("Wrong permisson to user status ");
            }
        })
        return null;
    }

    async banMember(banMember: any){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: banMember.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

        currentRoom.members.find(async member => {
            if (member.pseudo === banMember.pseudo && ((member.status === 'ADMIN' && banMember.askBanPseudo === currentRoom.owner) || (member.status !== 'ADMIN'))){
                currentRoom.ban.push(banMember.pseudo);
                this.leaveRoom(banMember);
                await this.roomRepository.save(currentRoom);
                return true;
            } else {
                console.log("Wrong permisson to ban this user");
                return null;
            }
        })
        return null;
    }

    async muteMember(mutedMember){
        // check if the room exist
        const currentRoom = await this.roomRepository.findOneBy({
            name: mutedMember.name,
         });
         if (!currentRoom){
             console.log("The room doesn't exist");
             return null;
         }

        currentRoom.members.find(async member => {
            if (member.pseudo === mutedMember.pseudo && member.status !== 'ADMIN'){
                member.mute = mutedMember.time;
                await this.roomRepository.save(currentRoom);
                return true;
            } else {
                console.log("Wrong permisson to ban this user");
                return null;
            }
        })
        console.log("The user doesn't exist");
        return null;
    }
}