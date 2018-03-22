import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VepPassVerifyMakePaymentComponent } from './vep-pass-verify-make-payment.component';

describe('VepPassVerifyMakePaymentComponent', () => {
  let component: VepPassVerifyMakePaymentComponent;
  let fixture: ComponentFixture<VepPassVerifyMakePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VepPassVerifyMakePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VepPassVerifyMakePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
