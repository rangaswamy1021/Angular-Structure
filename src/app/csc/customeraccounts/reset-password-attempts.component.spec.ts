import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordAttemptsComponent } from './reset-password-attempts.component';

describe('ResetPasswordAttemptsComponent', () => {
  let component: ResetPasswordAttemptsComponent;
  let fixture: ComponentFixture<ResetPasswordAttemptsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordAttemptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
