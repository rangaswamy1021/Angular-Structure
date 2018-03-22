import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CscPaymentDetailsComponent } from './csc-payment-details.component';

describe('CscPaymentDetailsComponent', () => {
  let component: CscPaymentDetailsComponent;
  let fixture: ComponentFixture<CscPaymentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CscPaymentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CscPaymentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
