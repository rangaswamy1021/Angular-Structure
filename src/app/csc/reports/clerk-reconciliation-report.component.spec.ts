import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClerkReconciliationReportComponent } from './clerk-reconciliation-report.component';

describe('ClerkReconciliationReportComponent', () => {
  let component: ClerkReconciliationReportComponent;
  let fixture: ComponentFixture<ClerkReconciliationReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClerkReconciliationReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClerkReconciliationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
