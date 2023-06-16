import { Test, TestingModule } from '@nestjs/testing';
import { DbWriterService } from './db-writer.service';

describe('DbWriterService', () => {
  let service: DbWriterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbWriterService],
    }).compile();

    service = module.get<DbWriterService>(DbWriterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
