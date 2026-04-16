import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalCardComponent } from './animal-card';

describe('AnimalCardComponent', () => {
  let component: AnimalCardComponent;
  let fixture: ComponentFixture<AnimalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalCardComponent);
    component = fixture.componentInstance;
    component.animal = {
      id: 1,
      name: 'Test',
      status: 'Sanatoasa',
      location: 'Hambar',
      type: 'vaca',
    };
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
