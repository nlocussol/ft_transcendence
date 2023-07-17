import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { SkipAuth } from 'src/utils/decorators';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import * as speakeasy from 'speakeasy';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private dbWriterService: DbWriterService,
    private httpService: HttpService,
  ) {}

  @SkipAuth()
  @Get('42')
  async retrieveAndSend42Token(@Query('code') code: string) {
    const body = {
      grant_type: process.env.API_GRANT_TYPE,
      client_id: process.env.API_CLIENT_ID,
      client_secret: process.env.API_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.API_REDIRECT_URL,
    };
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      validateStatus: function (status) {
        return status == 200
      }
    };
    const response = this.httpService
      .post('https://api.intra.42.fr/oauth/token', body, requestConfig)
      .pipe(
        map((response) => {
          return response.data.access_token;
        }),
      );
    const token42 = await lastValueFrom(response)
    return token42;
  }

  @SkipAuth()
  @Post('login')
  async login(
    @Body() login: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.dbWriterService.getDataUser(login.login);

    // Should never arrive since we login through 42 API
    if (!user) {
      throw new BadRequestException('No user');
    }

    const jwt = await this.jwtService.signAsync({
      login: user.login,
      pseudo: user.pseudo,
    });
    response.cookie('jwt', jwt, { httpOnly: true, sameSite: 'lax' });

    return {
      message: 'User logued',
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
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return {
      message: 'User logued out',
    };
  }

  @SkipAuth()
  @Post('verify2fa')
  async verify2fa(@Body() doubleFactor: any) {
    let base32 = await this.dbWriterService.getBase32(doubleFactor.login);
    // const code = speakeasy.totp({
    //   secret: base32,
    //   encoding: 'base32'
    // })
    // console.log("my pin:", doubleFactor.pin)
    // console.log("right one:", code)
    const verify = speakeasy.totp.verify({
      secret: base32,
      encoding: 'base32',
      token: doubleFactor.pin
    });
    console.log(verify)
    return verify;
  }
}
