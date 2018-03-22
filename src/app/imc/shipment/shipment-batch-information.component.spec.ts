import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentBatchInformationComponent } from './shipment-batch-information.component';

describe('ShipmentBatchInformationComponent', () => {
  let component: ShipmentBatchInformationComponent;
  let fixture: ComponentFixture<ShipmentBatchInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentBatchInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentBatchInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
