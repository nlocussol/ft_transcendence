import { BadRequestException, Body, Controller, Get, Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { SkipAuth } from 'src/utils/decorators';


@Controller('auth')
export class AuthController {

    constructor(
        private jwtService: JwtService,
        private dbWriterService: DbWriterService,
        ) {}
    
    @SkipAuth()
    @Post('login')
    async login(
        @Body () login: any,
        @Res( {passthrough: true} ) response: Response,
        ) {

        const user = await this.dbWriterService.getDataUser(login.login);
        
        // Should never arrive since we login through 42 API
        if (!user) {
            throw new BadRequestException('No user')
        }

        const jwt = await this.jwtService.signAsync( {login: user.login} );
        response.cookie('jwt', jwt, {httpOnly: true, sameSite: 'lax'});

        return {
            message: "User logued"
        };
    }

    @SkipAuth()
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
