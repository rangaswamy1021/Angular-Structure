import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComplaintComponent } from './dashboard-complaint.component';

describe('DashboardComplaintComponent', () => {
  let component: DashboardComplaintComponent;
  let fixture: ComponentFixture<DashboardComplaintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComplaintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
