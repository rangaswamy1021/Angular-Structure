import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerFulfillmentComponent } from './retailer-fulfillment.component';

describe('RetailerFulfillmentComponent', () => {
  let component: RetailerFulfillmentComponent;
  let fixture: ComponentFixture<RetailerFulfillmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerFulfillmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerFulfillmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
