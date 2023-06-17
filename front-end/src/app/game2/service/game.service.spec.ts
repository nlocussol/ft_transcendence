import { TestBed } from '@angular/core/testing';

import { GameService2 } from './game.service';

describe('GameService', () => {
  let service: GameService2;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService2);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
