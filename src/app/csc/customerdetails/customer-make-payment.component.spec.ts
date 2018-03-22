import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerMakePaymentComponent } from './customer-make-payment.component';

describe('CustomerMakePaymentComponent', () => {
  let component: CustomerMakePaymentComponent;
  let fixture: ComponentFixture<CustomerMakePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerMakePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerMakePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
