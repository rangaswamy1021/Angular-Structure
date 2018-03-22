import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderSearchComponent } from './purchase-order-search.component';

describe('PurchaseOrderSearchComponent', () => {
  let component: PurchaseOrderSearchComponent;
  let fixture: ComponentFixture<PurchaseOrderSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseOrderSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseOrderSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
