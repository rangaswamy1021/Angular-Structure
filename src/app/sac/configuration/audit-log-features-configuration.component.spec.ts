import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLogFeaturesConfigurationComponent } from './audit-log-features-configuration.component';

describe('AuditLogFeaturesConfigurationComponent', () => {
  let component: AuditLogFeaturesConfigurationComponent;
  let fixture: ComponentFixture<AuditLogFeaturesConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditLogFeaturesConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditLogFeaturesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
