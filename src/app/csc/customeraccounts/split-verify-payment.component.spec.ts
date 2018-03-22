import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitVerifyPaymentComponent } from './split-verify-payment.component';

describe('SplitVerifyPaymentComponent', () => {
  let component: SplitVerifyPaymentComponent;
  let fixture: ComponentFixture<SplitVerifyPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitVerifyPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitVerifyPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
