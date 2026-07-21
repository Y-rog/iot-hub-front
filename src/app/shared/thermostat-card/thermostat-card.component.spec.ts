import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThermostatCardComponent } from './thermostat-card.component';

describe('ThermostatCardComponent', () => {
  let component: ThermostatCardComponent;
  let fixture: ComponentFixture<ThermostatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThermostatCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThermostatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
