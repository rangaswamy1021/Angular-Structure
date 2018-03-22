import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayAAdvanceTollsToCustomerComponent } from './pay-a-advance-tolls-to-customer.component';

describe('PayAAdvanceTollsToCustomerComponent', () => {
  let component: PayAAdvanceTollsToCustomerComponent;
  let fixture: ComponentFixture<PayAAdvanceTollsToCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayAAdvanceTollsToCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayAAdvanceTollsToCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
