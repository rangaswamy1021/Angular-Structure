import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationPaymentConfirmationComponent } from './violation-payment-confirmation.component';

describe('ViolationPaymentConfirmationComponent', () => {
  let component: ViolationPaymentConfirmationComponent;
  let fixture: ComponentFixture<ViolationPaymentConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationPaymentConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationPaymentConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
