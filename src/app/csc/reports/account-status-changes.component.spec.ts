import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStatusChangesComponent } from './account-status-changes.component';

describe('AccountStatusChangesComponent', () => {
  let component: AccountStatusChangesComponent;
  let fixture: ComponentFixture<AccountStatusChangesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountStatusChangesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountStatusChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
