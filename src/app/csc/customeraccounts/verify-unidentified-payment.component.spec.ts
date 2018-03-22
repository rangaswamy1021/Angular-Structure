import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyUnidentifiedPaymentComponent } from './verify-unidentified-payment.component';

describe('VerifyUnidentifiedPaymentComponent', () => {
  let component: VerifyUnidentifiedPaymentComponent;
  let fixture: ComponentFixture<VerifyUnidentifiedPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyUnidentifiedPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyUnidentifiedPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
