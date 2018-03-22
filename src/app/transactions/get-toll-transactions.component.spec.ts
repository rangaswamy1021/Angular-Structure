import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTollTransactionsComponent } from './get-toll-transactions.component';

describe('GetTollTransactionsComponent', () => {
  let component: GetTollTransactionsComponent;
  let fixture: ComponentFixture<GetTollTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetTollTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetTollTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
