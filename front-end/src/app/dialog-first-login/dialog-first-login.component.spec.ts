import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFirstLoginComponent } from './dialog-first-login.component';

describe('DialogFirstLoginComponent', () => {
  let component: DialogFirstLoginComponent;
  let fixture: ComponentFixture<DialogFirstLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogFirstLoginComponent]
    });
    fixture = TestBed.createComponent(DialogFirstLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
