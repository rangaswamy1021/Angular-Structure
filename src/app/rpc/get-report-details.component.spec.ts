import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAccountStatusDetailsReportComponent } from './get-report-details.component';

describe('GetAccountStatusDetailsReportComponent', () => {
  let component: GetAccountStatusDetailsReportComponent;
  let fixture: ComponentFixture<GetAccountStatusDetailsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetAccountStatusDetailsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetAccountStatusDetailsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
