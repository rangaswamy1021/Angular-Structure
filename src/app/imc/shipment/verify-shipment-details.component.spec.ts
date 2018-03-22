import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyShipmentDetailsComponent } from './verify-shipment-details.component';

describe('VerifyShipmentDetailsComponent', () => {
  let component: VerifyShipmentDetailsComponent;
  let fixture: ComponentFixture<VerifyShipmentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyShipmentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyShipmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
