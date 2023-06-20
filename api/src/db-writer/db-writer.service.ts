import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import { message, pm, messageData, friend } from 'src/typeorm/user.entity';


@Injectable()
export class DbWriterService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}

    async createUser(newUser: User){

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
        user.pp = newUser.pp;
        user.friends = [];
        user.pm = [];

        // save in database (shared volume)
        await this.userRepository.save(user)
    }

    async addFriendToDb(user: User, friend: User, friendPseudo: string){
        // add friend inside the friend list
        const dataFriend: friend = {
            name: friendPseudo,
            pp: friend.pp,
            bloqued: false,
        }
        // check if the friend is not already inside friend list
        if (user.friends && user.friends.find(friend => friend.name === friendPseudo)){
            console.log("The friend already exist.");
            return null;
        }
        user.friends.push(dataFriend);
        // add a friend to the private message list
        const newMp: pm = {
            name: friendPseudo,
            messages: [],
        }
        user.pm.push(newMp);
        await this.userRepository.save(user);
    }

    async addFriend(newFriend: messageData){

        // check if user & friend exist inside db
        const user = await this.userRepository.findOneBy({
            pseudo: newFriend.pseudo,
        });
        const friend = await this.userRepository.findOneBy({
            pseudo: newFriend.friend,
        });
        if (user === friend){
            console.log("The user and friend's name are the same.");
            return null;
        }
        if (!user || !friend){
            console.log("The user doesn't exist.");
            return null;
        }
        // add new friend to both users list
        this.addFriendToDb(user, friend, newFriend.friend);
        this.addFriendToDb(friend, user, user.pseudo);
    }

    async getPm(obj: messageData){
        // check user
        const user = await this.userRepository.findOneBy({
            pseudo: obj.pseudo,
        });
        if (!user){
            console.log("The user didn't exist.");
            return null;
        }
        // return the conversation with the match friend
        for(let conversation of user.pm){
            if (conversation.name === obj.friend){
                return conversation.messages;
            }
        }
        console.log("There is no conversation corresponding with ", obj.friend);
    }

    async addMessage(user: User, friendName:string, newMessage: message){
        // search match friend and append the new message inside the conversation
        for(const index in user.pm){
            if (user.pm[index].name === friendName){
                user.pm[index].messages.push(newMessage);
                await this.userRepository.save(user);  
                return null;
            }
        }
    }

    async addPrivateMessage(obj: messageData){
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
            content: obj.content,
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
            console.log("getDataUser: The user didn't exist.");
            return null;
        }
        return user;
    }
}
