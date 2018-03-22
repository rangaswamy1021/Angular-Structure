import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnPurchaseOrderDetailsComponent } from './return-purchase-order-details.component';

describe('ReturnPurchaseOrderDetailsComponent', () => {
  let component: ReturnPurchaseOrderDetailsComponent;
  let fixture: ComponentFixture<ReturnPurchaseOrderDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnPurchaseOrderDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnPurchaseOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
