import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SacDashboardSettingsComponent } from './sac-dashboard-settings.component';

describe('SacDashboardSettingsComponent', () => {
  let component: SacDashboardSettingsComponent;
  let fixture: ComponentFixture<SacDashboardSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SacDashboardSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SacDashboardSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
