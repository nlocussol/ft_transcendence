import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent2 } from './game.component';

describe('GameComponent', () => {
  let component: GameComponent2;
  let fixture: ComponentFixture<GameComponent2>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameComponent2]
    });
    fixture = TestBed.createComponent(GameComponent2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
