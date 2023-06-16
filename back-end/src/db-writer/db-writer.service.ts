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
            return;
        }

        // create an instance of user table & fill it
        const user = new User();
        user.login = newUser.login;
        user.pseudo = newUser.login;
        user.email = newUser.email;
        user.pp = newUser.profilPicture;
        user.friends = [];

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
            return ;
        }

        // check if the friend is not already inside friend list
        if (user.friends && user.friends.includes(newFriend.friend)){
            console.log("The friend already exist.");
            return ;
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
            return ;
        }
        for(let conversation of user.mp){
            if (conversation.name === obj.friend)
                return conversation;
        }
        console.log("There is no conversation corresponding with ", obj.friend);
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
            return ;
        }

        const newMessage: message = {
            content: obj.msg,
            sender: obj.sender,
        }
        // search the mp interface of the corresponding friend
        for(const index in user.mp){
            if (user.mp[index].name === obj.friend){
                user.mp[index].messages.push(newMessage);
                return ;
            }
        }
        console.log("There is no conversation corresponding with ", obj.friend);
    }
}
