import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankDepositRequestsHistoryComponent } from './bank-deposit-requests-history.component';

describe('BankDepositRequestsHistoryComponent', () => {
  let component: BankDepositRequestsHistoryComponent;
  let fixture: ComponentFixture<BankDepositRequestsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankDepositRequestsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankDepositRequestsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
