import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/typeorm';


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
        user.email = newUser.email;
        user.pp = newUser.profilPicture;
        await this.userRepository.save(user)
        //const user = this.userRepository.create(newUser);
        //return this.userRepository.save(user)
    }
}
