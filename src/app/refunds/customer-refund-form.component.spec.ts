import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerRefundFormComponent } from './customer-refund-form.component';

describe('CustomerRefundFormComponent', () => {
  let component: CustomerRefundFormComponent;
  let fixture: ComponentFixture<CustomerRefundFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerRefundFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerRefundFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
