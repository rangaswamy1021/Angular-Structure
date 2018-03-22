import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountholderdetailsComponent } from './accountholderdetails.component';

describe('AccountholderdetailsComponent', () => {
  let component: AccountholderdetailsComponent;
  let fixture: ComponentFixture<AccountholderdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountholderdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountholderdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
