import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNotLoguedComponent } from './dialog-not-logued.component';

describe('DialogNotLoguedComponent', () => {
  let component: DialogNotLoguedComponent;
  let fixture: ComponentFixture<DialogNotLoguedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogNotLoguedComponent]
    });
    fixture = TestBed.createComponent(DialogNotLoguedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
