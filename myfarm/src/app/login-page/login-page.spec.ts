import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login-page';

describe('LoginPage (spec stub)', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit loginSuccess when invalid', () => {
    const spy = vi.fn();
    component.loginSuccess.subscribe(spy);

    component.loginForm.setValue({ username: '', password: '' });
    component.onSubmit();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit loginSuccess when valid', () => {
    const spy = vi.fn();
    component.loginSuccess.subscribe(spy);

    component.loginForm.setValue({ username: 'user', password: 'pass' });
    component.onSubmit();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
