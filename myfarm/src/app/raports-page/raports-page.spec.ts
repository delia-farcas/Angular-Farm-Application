import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaportsPage } from './raports-page';

describe('RaportsPage', () => {
  let component: RaportsPage;
  let fixture: ComponentFixture<RaportsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaportsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RaportsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
