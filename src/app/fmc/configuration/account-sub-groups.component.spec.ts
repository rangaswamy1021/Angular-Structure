import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSubGroupsComponent } from './account-sub-groups.component';

describe('AccountSubGroupsComponent', () => {
  let component: AccountSubGroupsComponent;
  let fixture: ComponentFixture<AccountSubGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountSubGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSubGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
