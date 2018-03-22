import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnPurchaseOrderComponent } from './return-purchase-order.component';

describe('ReturnPurchaseOrderComponent', () => {
  let component: ReturnPurchaseOrderComponent;
  let fixture: ComponentFixture<ReturnPurchaseOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnPurchaseOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnPurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
