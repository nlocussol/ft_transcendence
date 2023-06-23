import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import { message, pm, messageData, friend, match, stats } from 'src/typeorm/user.entity';


@Injectable()
export class DbWriterService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}

    async createUser(newUser: User){

        // search if the user is already inside the data base.
        const currentUser = await this.userRepository.findOneBy({
           pseudo: newUser.pseudo,
        });
        if (currentUser){
            console.log("The user already exist");
            return null;
        }

        // create an instance of user table & fill it
        const user = new User();
        user.authCode = crypto.randomUUID();
        user.pseudo = newUser.pseudo;
        user.email = newUser.email;
        user.pp = newUser.pp;
        user.friends = [];
        user.pm = [];
        user.history = [];

        let statsInit : stats = {
            loose: 0,
            win: 0,
            matchs: 0
        }
        user.stats = statsInit;

        // save in database (shared volume)
        await this.userRepository.save(user)
    }

    async addFriendToDb(user: User, friend: User, friendPseudo: string, uuid: string){
        // add friend inside the friend list
        const dataFriend: friend = {
            name: friendPseudo,
            pp: friend.pp,
            blocked: false,
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
            uuid: uuid,
            messages: [],
        }
        user.pm.push(newMp);
        await this.userRepository.save(user);
    }

    async addFriend(newFriend: messageData){

        // check if user & friend exist inside db
        let uuid: string = crypto.randomUUID()
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
        this.addFriendToDb(user, friend, newFriend.friend, uuid);
        this.addFriendToDb(friend, user, user.pseudo, uuid);
        return uuid;
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
        console.log("There is no conversation with ", obj.friend);
    }

    async addMessage(user: User, friendName:string, newMessage: message){
        // search match friend and append the new message inside the conversation
        for(const index in user.pm){
            if (user.pm[index].name === friendName){
                user.pm[index].messages.push(newMessage);
                await this.userRepository.save(user);  
                return user.pm[index].uuid;
            }
        }
        return null;
    }

    async addPrivateMessage(obj: messageData): Promise<string> {
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
        const ret = await this.addMessage(user, obj.friend, newMessage);
        const friendRet = await this.addMessage(friend, user.pseudo, newMessage);
        if (ret == null || friendRet == null)
            return null;
        return ret;
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

    async getFriends(pseudo: string){
        // check if user exist inside db
        const user = await this.userRepository.findOneBy({
            pseudo: pseudo,
        });
        if (!user){
            console.log("getDataUser: The user didn't exist.");
            return null;
        }

        let list = user.friends;
        for (var i of list){
            if (i.blocked === true)
                list.splice(list.indexOf(i, 0), 1);
        }
        return list;
    }   

    async changeUserPseudo(newName: any){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            pseudo: newName.currentPseudo,
         });
         if (!currentUser){
             console.log("The user doesn't exist");
             return null;
         }
 
         // change the current pseudo to the new one
         currentUser.pseudo = newName.newPseudo;
         await this.userRepository.save(currentUser)
        return true;
    }

    async changeUserPp(newPp: any){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            pseudo: newPp.pseudo,
         });
         if (!currentUser){
             console.log("The user doesn't exist");
             return null;
         }
 
         // change the current pp to the new one
         currentUser.pp = newPp.newPp;
         await this.userRepository.save(currentUser)
        return true;
    }

    async change2fa(change2fa: any){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            pseudo: change2fa.pseudo,
         });
         if (!currentUser){
             console.log("The user doesn't exist");
             return null;
         }
 
         // change the current 2fa setting to the new one
         currentUser.doubleAuth = change2fa.doubleAuth;
         await this.userRepository.save(currentUser)
        return true;
    }

    async blockFriend(blockFriend: any){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            pseudo: blockFriend.pseudo,
         });
         if (!currentUser){
             console.log("The user doesn't exist");
             return null;
         }
 
         // search the corresponding friend and set the new parameters
        for (var i in currentUser.friends){
            if (currentUser.friends[i].name == blockFriend.friend){
                currentUser.friends[i].blocked = blockFriend.block;
            }
        }
        await this.userRepository.save(currentUser)
        return true;
    }

    async fillStats(player: User, gameData:any, matchWinner:string){
        
        player.stats.matchs += 1;
        if (matchWinner === player.pseudo){
            player.stats.win += 1;
        } else {
            player.stats.loose += 1;
        }
        await this.userRepository.save(player)
    }

    async fillMatchHistory(gameData: any){
        // check if the user exist
        const player1 = await this.userRepository.findOneBy({
            pseudo: gameData.player1,
         });
         if (!player1){
             console.log("The user doesn't exist");
             return null;
         }
         const player2 = await this.userRepository.findOneBy({
            pseudo: gameData.player2,
         });
         if (!player2){
             console.log("The user doesn't exist");
             return null;
        }

        let matchWinner = gameData.score1 === 10 ? gameData.player2 : gameData.player1;

        let match1 :match = {
            ownScore: gameData.score1,
            opponentScore: gameData.score2,
            opponent: gameData.player2,
            winner: matchWinner
        }
        player1.history.push(match1);

        let match2 :match = {
            ownScore: gameData.score2,
            opponentScore: gameData.score1,
            opponent: gameData.player1,
            winner: matchWinner
        }
        player2.history.push(match2);

        this.fillStats(player1, gameData, matchWinner);
        this.fillStats(player2, gameData, matchWinner);
        return true;
    }
}

