import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import { message } from 'src/typeorm/user.entity';


@Injectable()
export class DbWriterService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}

    async createUser(newUser: any){
        const currentUser = await this.userRepository.findOneBy({
           login: newUser.login,
        });
        if (currentUser)
            return
        const user = new User();
        user.login = newUser.login;
        user.pseudo = newUser.login;
        user.email = newUser.email;
        user.pp = newUser.profilPicture;
        await this.userRepository.save(user)
    }

    async addFriend(newFriend: any){
        const user = await this.userRepository.findOneBy({
            pseudo: newFriend.pseudo,
        });
        if (!user){
            console.log("The user didn't exist.");
            return ;
        }
        if (user.friends && user.friends.includes(newFriend.friend)){
            console.log("The friend already exist.");
            return ;
        }
        user.friends.push(newFriend.friend);
        await this.userRepository.save(user)
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
        const user = await this.userRepository.findOneBy({
            pseudo: obj.pseudo,
        });
        if (!user){
            console.log("The user didn't exist.");
            return ;
        }
        for(const index in user.mp){
            if (user.mp[index].name === obj.friend){
                user.mp[index].message.push(obj.msg);
                return ;
            }
        }
        console.log("There is no conversation corresponding with ", obj.friend);
    }
}
