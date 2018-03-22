import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveShipmentDetailsComponent } from './receive-shipment-details.component';

describe('ReceiveShipmentDetailsComponent', () => {
  let component: ReceiveShipmentDetailsComponent;
  let fixture: ComponentFixture<ReceiveShipmentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceiveShipmentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveShipmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
