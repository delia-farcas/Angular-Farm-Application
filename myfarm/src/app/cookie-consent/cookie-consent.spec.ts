import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CookieConsent } from './cookie-consent';

describe('CookieConsent', () => {
  let component: CookieConsent;
  let fixture: ComponentFixture<CookieConsent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieConsent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CookieConsent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
