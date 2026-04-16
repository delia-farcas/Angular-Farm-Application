import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPage } from './app-page';

describe('AppPage', () => {
  let component: AppPage;
  let fixture: ComponentFixture<AppPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AppPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
