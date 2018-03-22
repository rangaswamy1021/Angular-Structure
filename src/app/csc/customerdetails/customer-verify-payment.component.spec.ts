import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVerifyPaymentComponent } from './customer-verify-payment.component';

describe('CustomerVerifyPaymentComponent', () => {
  let component: CustomerVerifyPaymentComponent;
  let fixture: ComponentFixture<CustomerVerifyPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerVerifyPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerVerifyPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
