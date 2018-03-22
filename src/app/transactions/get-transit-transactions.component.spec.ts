import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTransitTransactionsComponent } from './get-transit-transactions.component';

describe('GetTransitTransactionsComponent', () => {
  let component: GetTransitTransactionsComponent;
  let fixture: ComponentFixture<GetTransitTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetTransitTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetTransitTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
