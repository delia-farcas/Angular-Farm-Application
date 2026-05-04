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

  it('should not call login when invalid', () => {
    const userServiceSpy = vi.spyOn(component['userService'], 'login').mockImplementation((() => {}) as any);

    component.loginForm.setValue({ email: '', password: '' });
    component.onSubmit();

    expect(userServiceSpy).not.toHaveBeenCalled();
  });

  it('should call login when valid', () => {
    const userServiceSpy = vi.spyOn(component['userService'], 'login').mockReturnValue({ subscribe: () => {} } as any);

    component.loginForm.setValue({ email: 'test@test.com', password: 'pass' });
    component.onSubmit();

    expect(userServiceSpy).toHaveBeenCalledTimes(1);
    expect(userServiceSpy).toHaveBeenCalledWith('test@test.com', 'pass');
  });
});
