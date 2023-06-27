import { Module } from '@nestjs/common';
import { DbWriterController } from './db-writer.controller';
import { DbWriterService } from './db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DbWriterController],
  providers: [DbWriterService],
  exports: [DbWriterService]
})

export class DbWriterModule {}
