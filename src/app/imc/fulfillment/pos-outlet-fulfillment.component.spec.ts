import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PosOutletFulfillmentComponent } from './pos-outlet-fulfillment.component';

describe('PosOutletFulfillmentComponent', () => {
  let component: PosOutletFulfillmentComponent;
  let fixture: ComponentFixture<PosOutletFulfillmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PosOutletFulfillmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PosOutletFulfillmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
