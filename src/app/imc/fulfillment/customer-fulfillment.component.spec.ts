import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFulfillmentComponent } from './customer-fulfillment.component';

describe('CustomerFulfillmentComponent', () => {
  let component: CustomerFulfillmentComponent;
  let fixture: ComponentFixture<CustomerFulfillmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerFulfillmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerFulfillmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
