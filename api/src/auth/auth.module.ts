import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { HttpModule } from '@nestjs/axios';


// Change secret to be in env file //
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '3600s' },
    }),
    TypeOrmModule.forFeature([User]),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthController, DbWriterService,],
  exports: [AuthService, AuthController]
})
export class AuthModule {}
