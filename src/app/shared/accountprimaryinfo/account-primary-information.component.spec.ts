import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPrimaryInformationComponent } from './account-primary-information.component';

describe('AccountPrimaryInformationComponent', () => {
  let component: AccountPrimaryInformationComponent;
  let fixture: ComponentFixture<AccountPrimaryInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPrimaryInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPrimaryInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
