import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DbWriterService } from 'src/db-writer/db-writer.service';


@Controller('auth')
export class AuthController {

    constructor(
        private jwtService: JwtService,
        private dbWriterService: DbWriterService,
        ) {}
    
    @Post('login')
    async login(
        @Body () pseudo: any,
        @Res( {passthrough: true} ) response: Response,
        ) {

        const user = await this.dbWriterService.getDataUser(pseudo.pseudo);
        
        // Should never arrive since we login through 42 API
        if (!user) {
            throw new BadRequestException('No user')
        }

        const jwt = await this.jwtService.signAsync( {pseudo: user.pseudo} );
        response.cookie('jwt', jwt, {httpOnly: true, sameSite: 'lax'});

        return {
            message: "User logued"
        };
    }

    @Get('user')
    async user(@Req() request: Request) {
        try {
            const cookie = request.cookies['jwt'];
            const data = await this.jwtService.verifyAsync(cookie);
            if (!data) {
                throw new UnauthorizedException();
            }
            return data;
        } catch (e) {
            throw new UnauthorizedException();
        }

    }

    @Post('logout')
    async logout(
        @Res( {passthrough: true} ) response: Response,
    ) {
        response.clearCookie('jwt');

        return {
            message: "User logued out"
        }
    }
}