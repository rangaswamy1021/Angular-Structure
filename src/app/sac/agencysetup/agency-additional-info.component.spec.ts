import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyAdditionalInfoComponent } from './agency-additional-info.component';

describe('AgencyAdditionalInfoComponent', () => {
  let component: AgencyAdditionalInfoComponent;
  let fixture: ComponentFixture<AgencyAdditionalInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgencyAdditionalInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgencyAdditionalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
