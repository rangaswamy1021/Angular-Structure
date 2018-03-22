import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyViolationPaymentComponent } from './verify-violation-payment.component';

describe('VerifyViolationPaymentComponent', () => {
  let component: VerifyViolationPaymentComponent;
  let fixture: ComponentFixture<VerifyViolationPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyViolationPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyViolationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
