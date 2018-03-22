import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionProcessingErrorReportComponent } from './transaction-processing-error-report.component';

describe('TransactionProcessingErrorReportComponent', () => {
  let component: TransactionProcessingErrorReportComponent;
  let fixture: ComponentFixture<TransactionProcessingErrorReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionProcessingErrorReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionProcessingErrorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
