import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestReceivedShipmentComponent } from './test-received-shipment.component';

describe('TestReceivedShipmentComponent', () => {
  let component: TestReceivedShipmentComponent;
  let fixture: ComponentFixture<TestReceivedShipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestReceivedShipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestReceivedShipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
