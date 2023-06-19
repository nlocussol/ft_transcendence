import { Test, TestingModule } from '@nestjs/testing';
import { DbWriterRoomController } from './db-writer-room.controller';

describe('DbWriterRoomController', () => {
  let controller: DbWriterRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbWriterRoomController],
    }).compile();

    controller = module.get<DbWriterRoomController>(DbWriterRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
