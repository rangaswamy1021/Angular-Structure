import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInfoHeaderComponent } from './account-info-header.component';

describe('AccountInfoHeaderComponent', () => {
  let component: AccountInfoHeaderComponent;
  let fixture: ComponentFixture<AccountInfoHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountInfoHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountInfoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
