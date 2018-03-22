import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerOrderDetailsComponent } from './retailer-order-details.component';

describe('RetailerOrderDetailsComponent', () => {
  let component: RetailerOrderDetailsComponent;
  let fixture: ComponentFixture<RetailerOrderDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerOrderDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
