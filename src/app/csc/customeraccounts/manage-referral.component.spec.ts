import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReferralComponent } from './manage-referral.component';

describe('ManageReferralComponent', () => {
  let component: ManageReferralComponent;
  let fixture: ComponentFixture<ManageReferralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageReferralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
