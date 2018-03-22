import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClerkCloseOutReportComponent } from './clerk-close-out-report.component';

describe('ClerkCloseOutReportComponent', () => {
  let component: ClerkCloseOutReportComponent;
  let fixture: ComponentFixture<ClerkCloseOutReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClerkCloseOutReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClerkCloseOutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
