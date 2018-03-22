import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReversalsComponent } from './payment-reversals.component';

describe('PaymentReversalsComponent', () => {
  let component: PaymentReversalsComponent;
  let fixture: ComponentFixture<PaymentReversalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentReversalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentReversalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
