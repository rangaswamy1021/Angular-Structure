import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnHistoryReportComponent } from './icn-history-report.component';

describe('IcnHistoryReportComponent', () => {
  let component: IcnHistoryReportComponent;
  let fixture: ComponentFixture<IcnHistoryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnHistoryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnHistoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
