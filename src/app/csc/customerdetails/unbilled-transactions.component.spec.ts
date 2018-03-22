import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnbilledTransactionsComponent } from './unbilled-transactions.component';

describe('UnbilledTransactionsComponent', () => {
  let component: UnbilledTransactionsComponent;
  let fixture: ComponentFixture<UnbilledTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnbilledTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnbilledTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
