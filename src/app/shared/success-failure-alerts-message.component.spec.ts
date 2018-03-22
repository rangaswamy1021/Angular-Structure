import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessFailureAlertsMessageComponent } from './success-failure-alerts-message.component';

describe('SuccessFailureAlertsMessageComponent', () => {
  let component: SuccessFailureAlertsMessageComponent;
  let fixture: ComponentFixture<SuccessFailureAlertsMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessFailureAlertsMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessFailureAlertsMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
