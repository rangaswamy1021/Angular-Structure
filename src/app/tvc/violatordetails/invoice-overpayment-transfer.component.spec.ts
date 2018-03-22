import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceOverpaymentTransferComponent } from './invoice-overpayment-transfer.component';

describe('InvoiceOverpaymentTransferComponent', () => {
  let component: InvoiceOverpaymentTransferComponent;
  let fixture: ComponentFixture<InvoiceOverpaymentTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceOverpaymentTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceOverpaymentTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
