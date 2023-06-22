import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Room } from 'src/typeorm';
import { member } from 'src/typeorm/room.entity';
import { message } from 'src/typeorm/user.entity';

@Injectable()
export class DbWriterRoomService {
    constructor(
        @InjectRepository(Room) private readonly roomRepository: Repository<Room>
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
         room.messages = [];

         // the first user is admin
         const admin: member = {
            pseudo: newRoom.owner,
            status: 'ADMIN',
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
            if (!tmp.members.find(membre => membre.pseudo === userName))
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
         // create an instance of membre & push back to the membre list
         const newMembre: member = {
            pseudo: newUser.pseudo,
            status: 'NORMAL',
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
        console.log("Werid problems, \
        can't find the user who change the room name inside the database");
        return null;
    }
}