import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsByAccountComponent } from './transactions-by-account.component';

describe('TransactionsByAccountComponent', () => {
  let component: TransactionsByAccountComponent;
  let fixture: ComponentFixture<TransactionsByAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionsByAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsByAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
