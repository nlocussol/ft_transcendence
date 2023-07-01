import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewUserFormComponent } from './new-user-form.component';

describe('NewUserFormComponent', () => {
  let component: NewUserFormComponent;
  let fixture: ComponentFixture<NewUserFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewUserFormComponent]
    });
    fixture = TestBed.createComponent(NewUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
