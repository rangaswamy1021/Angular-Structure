import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskManagersEmailSettingsComponent } from './helpdesk-managers-email-settings.component';

describe('HelpdeskManagersEmailSettingsComponent', () => {
  let component: HelpdeskManagersEmailSettingsComponent;
  let fixture: ComponentFixture<HelpdeskManagersEmailSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpdeskManagersEmailSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpdeskManagersEmailSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
