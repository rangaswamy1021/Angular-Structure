import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetFerryTransactionsComponent } from './get-ferry-transactions.component';

describe('GetFerryTransactionsComponent', () => {
  let component: GetFerryTransactionsComponent;
  let fixture: ComponentFixture<GetFerryTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetFerryTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetFerryTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
