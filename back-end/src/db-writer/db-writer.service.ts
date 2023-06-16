import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import { message, mp } from 'src/typeorm/user.entity';


@Injectable()
export class DbWriterService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}

    async createUser(newUser: any){

        // search if the user is already inside the data base.
        const currentUser = await this.userRepository.findOneBy({
           login: newUser.login,
        });
        if (currentUser){
            console.log("The user already exist");
            return null;
        }

        // create an instance of user table & fill it
        const user = new User();
        user.login = newUser.login;
        user.pseudo = newUser.login;
        user.email = newUser.email;
        user.pp = newUser.profilPicture;
        user.friends = [];
        user.mp = [];

        // save in database (shared volume)
        await this.userRepository.save(user)
    }

    async addFriend(newFriend: any){

        // check if user & friend exist inside db
        const user = await this.userRepository.findOneBy({
            pseudo: newFriend.pseudo,
        });
        const friend = await this.userRepository.findOneBy({
            pseudo: newFriend.friend,
        });
        if (!user || !friend){
            console.log("The user didn't exist.");
            return null;
        }

        // check if the friend is not already inside friend list
        if (user.friends && user.friends.includes(newFriend.friend)){
            console.log("The friend already exist.");
            return null;
        }

        // add user inside the list & friend list
        user.friends.push(newFriend.friend);
        const newMp: mp = {
            name: newFriend.friend,
            messages: [],
        }
        user.mp.push(newMp);
        await this.userRepository.save(user);
    }

    async getMp(obj: any){
        const user = await this.userRepository.findOneBy({
            pseudo: obj.pseudo,
        });
        if (!user){
            console.log("The user didn't exist.");
            return null;
        }
        for(let conversation of user.mp){
            if (conversation.name === obj.friend){
                console.log(conversation.messages)
                return conversation;
            }
        }
        console.log("There is no conversation corresponding with ", obj.friend);
    }

    async addMessage(user: any, friendName:string, newMessage: message){
        // search match friend and append the new message inside the conversation
        for(const index in user.mp){
            if (user.mp[index].name === friendName){
                user.mp[index].messages.push(newMessage);
                await this.userRepository.save(user);  
                return null;
            }
        }
    }

    async writeMessage(obj: any){
        // check if user & friend exist inside db
        const user = await this.userRepository.findOneBy({
            pseudo: obj.pseudo,
        });
        const friend = await this.userRepository.findOneBy({
            pseudo: obj.friend,
        });
        if (!user || !friend){
            console.log("The user didn't exist.");
            return null;
        }

        const newMessage: message = {
            content: obj.msg,
            sender: obj.sender,
        }

        // add new message inside user and friend conversation
        this.addMessage(user, obj.friend, newMessage);
        this.addMessage(friend, user.pseudo, newMessage);
    }

    async getDataUser(pseudo: string){
        // check if user exist inside db
        const user = await this.userRepository.findOneBy({
            pseudo: pseudo,
        });
        if (!user){
            console.log("The user didn't exist.");
            return null;
        }
        return user;
    }
}
