import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionActivityDetailsComponent } from './transaction-activity-details.component';

describe('TransactionActivityDetailsComponent', () => {
  let component: TransactionActivityDetailsComponent;
  let fixture: ComponentFixture<TransactionActivityDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionActivityDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionActivityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
