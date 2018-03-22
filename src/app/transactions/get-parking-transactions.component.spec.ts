import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetParkingTransactionsComponent } from './get-parking-transactions.component';

describe('GetParkingTransactionsComponent', () => {
  let component: GetParkingTransactionsComponent;
  let fixture: ComponentFixture<GetParkingTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetParkingTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetParkingTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
