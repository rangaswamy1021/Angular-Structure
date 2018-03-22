import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPaymentConfirmationComponent } from './customer-payment-confirmation.component';

describe('CustomerPaymentConfirmationComponent', () => {
  let component: CustomerPaymentConfirmationComponent;
  let fixture: ComponentFixture<CustomerPaymentConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerPaymentConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPaymentConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
