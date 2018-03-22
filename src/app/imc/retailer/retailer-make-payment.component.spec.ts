import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerMakePaymentComponent } from './retailer-make-payment.component';

describe('RetailerMakePaymentComponent', () => {
  let component: RetailerMakePaymentComponent;
  let fixture: ComponentFixture<RetailerMakePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerMakePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerMakePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
