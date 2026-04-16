import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BazingaPage } from './bazinga-page';

describe('BazingaPage', () => {
  let component: BazingaPage;
  let fixture: ComponentFixture<BazingaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BazingaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BazingaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
