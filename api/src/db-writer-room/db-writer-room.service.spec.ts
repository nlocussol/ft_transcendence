import { Test, TestingModule } from '@nestjs/testing';
import { DbWriterRoomService } from './db-writer-room.service';

describe('DbWriterRoomService', () => {
  let service: DbWriterRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbWriterRoomService],
    }).compile();

    service = module.get<DbWriterRoomService>(DbWriterRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
