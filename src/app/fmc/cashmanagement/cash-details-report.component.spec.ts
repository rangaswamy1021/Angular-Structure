import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDetailsReportComponent } from './cash-details-report.component';

describe('CashDetailsReportComponent', () => {
  let component: CashDetailsReportComponent;
  let fixture: ComponentFixture<CashDetailsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashDetailsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashDetailsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
