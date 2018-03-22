import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAdjustmentsComponent } from './account-adjustments.component';

describe('AccountAdjustmentsComponent', () => {
  let component: AccountAdjustmentsComponent;
  let fixture: ComponentFixture<AccountAdjustmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountAdjustmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
