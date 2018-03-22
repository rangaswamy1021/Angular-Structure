import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMailServerSettingsComponent } from './add-mail-server-settings.component';

describe('AddMailServerSettingsComponent', () => {
  let component: AddMailServerSettingsComponent;
  let fixture: ComponentFixture<AddMailServerSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMailServerSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMailServerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
