import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';
import { message, pm, messageData, friend, match, stats, modify2fa, changeBlockStatus, changePseudo, addFriend, newPp, notif, deleteNotif } from 'src/typeorm/user.entity';
import { GameData } from 'src/game/models/game.models';


@Injectable()
export class DbWriterService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}

    async createUser(newUser: User){

        // search if the user is already inside the data base.
        const currentUserLogin = await this.userRepository.findOneBy({
            login: newUser.login,
         });
        if (currentUserLogin){
            console.log("The user already exist");
            return null;
        }

        // create an instance of user table & fill it
        const user = new User();
        user.authCode = crypto.randomUUID();
        user.pseudo = newUser.login;
        user.pp = newUser.pp;
        user.login = newUser.login
        user.doubleAuth = false;
        user.friends = [];
        user.pm = [];
        user.history = [];
        user.notif = [];

        let statsInit : stats = {
            lose: 0,
            win: 0,
            matchs: 0
        }
        user.stats = statsInit;

        // save in database (shared volume)
        await this.userRepository.save(user)
    }

    async addFriendToDb(user: User, friend: User, friendLogin: string, uuid: string){
        // add friend inside the friend list
        const dataFriend: friend = {
            name: friendLogin,
            pp: friend.pp,
            blocked: false,
        }
        // check if the friend is not already inside friend list
        if (user.friends && user.friends.find(friend => friend.name === friendLogin)){
            console.log("addFriend: The friend already exist.");
            return null;
        }
        user.friends.push(dataFriend);
        // add a friend to the private message list
        const newMp: pm = {
            name: friendLogin,
            uuid: uuid,
            messages: [],
        }
        user.pm.push(newMp);
        await this.userRepository.save(user);
    }

    async addFriend(newFriend: addFriend){

        // check if user & friend exist inside db
        let uuid: string = crypto.randomUUID()
        const user = await this.userRepository.findOneBy({
            login: newFriend.login,
        });
        const friend = await this.userRepository.findOneBy({
            login: newFriend.friend,
        });
        if (newFriend.login === newFriend.friend){
            console.log("addFriend: The user and friend's name are the same.");
            return null;
        }
        if (!user || !friend){
            console.log("addFriend:The user doesn't exist.");
            return null;
        }
        // add new friend to both users list
        this.addFriendToDb(user, friend, newFriend.friend, uuid);
        this.addFriendToDb(friend, user, user.login, uuid);
        return uuid;
    }

    async getPm(obj: messageData){
        // check user
        const user = await this.userRepository.findOneBy({
            login: obj.login,
        });
        if (!user){
            console.log("GetPm: The user didn't exist.");
            return null;
        }
        // return the conversation with the match friend
        for(let conversation of user.pm){
            if (conversation.name === obj.friend){
                return conversation.messages;
            }
        }
        console.log("GetPm: There is no conversation with ", obj.friend);
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

    async getPmUuid(obj: addFriend) {
        const user = await this.userRepository.findOneBy({
            login: obj.login,
        });
        const friend = await this.userRepository.findOneBy({
            login: obj.friend,
        });
        if (!user || !friend){
            console.log("The user didn't exist.");
            return null;
        }
        for(const index in user.pm){
            if (user.pm[index].name === friend.login)
                return user.pm[index].uuid;
        }
        return null;
    }

    async addPrivateMessage(obj: messageData): Promise<string> {
        // check if user & friend exist inside db
        const user = await this.userRepository.findOneBy({
            login: obj.login,
        });
        const friend = await this.userRepository.findOneBy({
            login: obj.friend,
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
        const friendRet = await this.addMessage(friend, user.login, newMessage);
        if (ret == null || friendRet == null)
            return null;
        return ret;
    }

    async getDataUser(login: string){
        // check if user exist inside db
        if (login == undefined) {
            return undefined
        }
        const user = await this.userRepository.findOneBy({
            login: login,
        });
        if (!user){
            console.log("getDataUser: The user does not exist.");
            throw new BadRequestException('No user with this login')
        }
        return user;
    }

    async getFriends(login: string){
        // check if user exist inside db
        const user = await this.userRepository.findOneBy({
            login: login,
        });
        if (!user){
            console.log("getFriends: The user does not exist.");
            return null;
        }
        return user.friends;
    }   

    async changeUserPseudo(newName: changePseudo){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            login: newName.currentLogin,
         });
         if (!currentUser){
             console.log("changeUserPseudo: The user does not exist");
             return null;
         }
        // check if the new username is not already take
        const newUserByLogin = await this.userRepository.findOneBy({
            login: newName.newPseudo,
         });
        const newUserByPseudo = await this.userRepository.findOneBy({
            pseudo: newName.newPseudo,
         });
         if ((newUserByLogin && newUserByLogin.login !== newName.currentLogin)
            || newUserByPseudo) {
            console.log("changeUserPseudo: The new username is already taken");
            return null
         }
         // change the current pseudo to the new one
         currentUser.pseudo = newName.newPseudo;
         await this.userRepository.save(currentUser)
        return true;
    }

    async changeUserPp(newPp: newPp){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            login: newPp.login,
         });
         if (!currentUser){
             console.log("changeUserPp: The user does not exist");
             return null;
         }
 
         // change the current pp to the new one
         currentUser.pp = newPp.newPp;
         await this.userRepository.save(currentUser)
        return true;
    }

    async change2fa(change2fa: modify2fa){
        // check if the user exist
        const currentUser = await this.userRepository.findOneBy({
            login: change2fa.login,
         });
         if (!currentUser){
             console.log("change2fa: The user does not exist");
             return null;
         }
 
         // change the current 2fa setting to the new one
         currentUser.doubleAuth = change2fa.doubleAuth;
         await this.userRepository.save(currentUser)
        return true;
    }

    async blockFriend(blockFriend: changeBlockStatus){
        // check if the user exist
        
        const currentUser = await this.userRepository.findOneBy({
            login: blockFriend.login,
         });
         if (!currentUser){
             console.log("blockFriend: The user doesn't exist");
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

    async fillStats(player: User, matchWinner:string){
        
        player.stats.matchs += 1;
        if (matchWinner === player.login){
            player.stats.win += 1;
        } else {
            player.stats.lose += 1;
        }
        await this.userRepository.save(player)
    }

    async fillMatchHistory(gameData: GameData) {
        // check if the user exist
        const player1 = await this.userRepository.findOneBy({
            login: gameData.players[0].login,
         });
         if (!player1){
             console.log("fillMatchHistory: The user doesn't exist");
             return null;
         }
         const player2 = await this.userRepository.findOneBy({
            login: gameData.players[1].login,
         });
         if (!player2){
             console.log("fillMatchHistory: The user doesn't exist");
             return null;
        }

        let matchWinner: string;
        if (gameData.players[0].score == 5)
            matchWinner = gameData.players[0].login;
        else
            matchWinner = gameData.players[1].login;
        

        let match1: match = {
            ownScore: gameData.players[0].score,
            opponentScore: gameData.players[1].score,
            opponent: gameData.players[1].login,
            winner: matchWinner
        }
        player1.history.push(match1);

        let match2 :match = {
            ownScore: gameData.players[1].score,
            opponentScore: gameData.players[0].score,
            opponent: gameData.players[0].login,
            winner: matchWinner
        }
        player2.history.push(match2);

        this.fillStats(player1, matchWinner);
        this.fillStats(player2, matchWinner);
        return true;
    }

    async getLeaderboard(){
        const players = await this.userRepository.find();

        const sortedPlayer = players.sort(
            (a, b) => (a.stats.win - a.stats.lose > b.stats.win - b.stats.lose ? -1 : 1)
        )
        return sortedPlayer
    }

    async addNotif(newNotif:any){        
        // check if the user exist
        // HERE : LOGIN CHANGED INTO PSEUDO BECAUSE neNotif.friend envoie pseudo
        const currentUser = await this.userRepository.findOneBy({
            pseudo: newNotif.friend,
         });
         if (!currentUser){
             console.log("addNotif: The user does not exist");
             return null;
         }
         let notif: notif =  {
            login: newNotif.login,
            type: newNotif.type,
            content: newNotif.content,
        }
        currentUser.notif.push(notif);
        await this.userRepository.save(currentUser)
        return true;
         // change the current 2fa setting to the new one
     
    }

    async deleteNotif(deleteNotif: deleteNotif) {
        const currentUser = await this.userRepository.findOneBy({
            login: deleteNotif.login,
         });
         if (!currentUser){
             console.log("addNotif: The user does not exist");
             return null;
         }
        let i = parseInt(deleteNotif.index);

        if (i > -1) {
            currentUser.notif.splice(i, 1);
        }
        await this.userRepository.save(currentUser)
        return true;
    }
}