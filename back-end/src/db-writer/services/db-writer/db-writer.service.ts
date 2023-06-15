import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";

@Injectable()
export class DbWriterService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ){}

    async createUser(newUser: any){
        const currentUser = await this.userRepository.findOneBy({
            name: newUser.name,
        });
        const user = new User();
        user.name = newUser.login;
        user.email = newUser.email;
        user.pp = newUser.profilPicture;
        await this.userRepository.save(user)
        return ;
    }

    findUsersByToken(token: string){
        return this.userRepository.findOne(token);
    }
}
