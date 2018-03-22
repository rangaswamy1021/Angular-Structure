import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderItemsReturnedComponent } from './purchase-order-items-returned.component';

describe('PurchaseOrderItemsReturnedComponent', () => {
  let component: PurchaseOrderItemsReturnedComponent;
  let fixture: ComponentFixture<PurchaseOrderItemsReturnedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderItemsReturnedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderItemsReturnedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
