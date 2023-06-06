import { Test, TestingModule } from '@nestjs/testing';
import { PongDataService } from './pong-data.service';

describe('PongDataService', () => {
  let service: PongDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PongDataService],
    }).compile();

    service = module.get<PongDataService>(PongDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
