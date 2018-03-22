import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTypeHistoryComponent } from './transaction-type-history.component';

describe('TransactionTypeHistoryComponent', () => {
  let component: TransactionTypeHistoryComponent;
  let fixture: ComponentFixture<TransactionTypeHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionTypeHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionTypeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
