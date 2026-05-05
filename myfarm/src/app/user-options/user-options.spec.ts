import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOptions } from './user-options';

describe('UserOptions', () => {
  let component: UserOptions;
  let fixture: ComponentFixture<UserOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(UserOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
