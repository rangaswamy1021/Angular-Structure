import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverPaymentTransferComponent } from './over-payment-transfer.component';

describe('OverPaymentTransferComponent', () => {
  let component: OverPaymentTransferComponent;
  let fixture: ComponentFixture<OverPaymentTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverPaymentTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverPaymentTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
