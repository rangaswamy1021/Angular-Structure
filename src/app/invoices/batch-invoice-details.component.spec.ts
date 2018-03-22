import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchInvoiceDetailsComponent } from './batch-invoice-details.component';

describe('BatchInvoiceDetailsComponent', () => {
  let component: BatchInvoiceDetailsComponent;
  let fixture: ComponentFixture<BatchInvoiceDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchInvoiceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchInvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
