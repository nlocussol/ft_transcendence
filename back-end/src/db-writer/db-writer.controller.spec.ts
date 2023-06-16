import { Test, TestingModule } from '@nestjs/testing';
import { DbWriterController } from './db-writer.controller';

describe('DbWriterController', () => {
  let controller: DbWriterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbWriterController],
    }).compile();

    controller = module.get<DbWriterController>(DbWriterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
