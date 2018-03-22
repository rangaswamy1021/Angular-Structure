import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRevenueComponent } from './transaction-revenue.component';

describe('TransactionRevenueComponent', () => {
  let component: TransactionRevenueComponent;
  let fixture: ComponentFixture<TransactionRevenueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionRevenueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
