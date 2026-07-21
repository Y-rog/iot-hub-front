import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirthingsCardComponent } from './airthings-card.component';

describe('AirthingsCardComponent', () => {
  let component: AirthingsCardComponent;
  let fixture: ComponentFixture<AirthingsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirthingsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirthingsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
