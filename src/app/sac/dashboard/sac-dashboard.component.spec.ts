import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SacDashboardComponent } from './sac-dashboard.component';

describe('SacDashboardComponent', () => {
  let component: SacDashboardComponent;
  let fixture: ComponentFixture<SacDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SacDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SacDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
