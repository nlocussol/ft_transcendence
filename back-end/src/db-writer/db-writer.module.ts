import { Module } from '@nestjs/common';
import { DbWriterController } from './controllers/db-writer/db-writer.controller';
import { DbWriterService } from './services/db-writer/db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DbWriterController],
  providers: [DbWriterService]
})

export class DbWriterModule {}
