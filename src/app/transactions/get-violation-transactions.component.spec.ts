import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetViolationTransactionsComponent } from './get-violation-transactions.component';

describe('GetViolationTransactionsComponent', () => {
  let component: GetViolationTransactionsComponent;
  let fixture: ComponentFixture<GetViolationTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetViolationTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetViolationTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
