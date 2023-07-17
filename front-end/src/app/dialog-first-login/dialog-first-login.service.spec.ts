import { TestBed } from '@angular/core/testing';

import { DialogFirstLoginService } from './dialog-first-login.service';

describe('DialogFirstLoginService', () => {
  let service: DialogFirstLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogFirstLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
