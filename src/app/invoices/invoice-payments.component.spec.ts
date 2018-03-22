import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePaymentsComponent } from './invoice-payments.component';

describe('InvoicePaymentsComponent', () => {
  let component: InvoicePaymentsComponent;
  let fixture: ComponentFixture<InvoicePaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicePaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
