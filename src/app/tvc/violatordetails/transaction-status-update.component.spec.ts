import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionStatusUpdateComponent } from './transaction-status-update.component';

describe('TransactionStatusUpdateComponent', () => {
  let component: TransactionStatusUpdateComponent;
  let fixture: ComponentFixture<TransactionStatusUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionStatusUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionStatusUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
