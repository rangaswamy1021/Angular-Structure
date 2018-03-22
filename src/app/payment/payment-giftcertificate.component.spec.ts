import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentGiftcertificateComponent } from './payment-giftcertificate.component';

describe('PaymentGiftcertificateComponent', () => {
  let component: PaymentGiftcertificateComponent;
  let fixture: ComponentFixture<PaymentGiftcertificateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentGiftcertificateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentGiftcertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
