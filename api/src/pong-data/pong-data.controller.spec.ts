import { Test, TestingModule } from '@nestjs/testing';
import { PongDataController } from './pong-data.controller';

describe('PongDataController', () => {
  let controller: PongDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PongDataController],
    }).compile();

    controller = module.get<PongDataController>(PongDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
