import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentServiceTypesComponent } from './shipment-service-types.component';

describe('ShipmentServiceTypesComponent', () => {
  let component: ShipmentServiceTypesComponent;
  let fixture: ComponentFixture<ShipmentServiceTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentServiceTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentServiceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
