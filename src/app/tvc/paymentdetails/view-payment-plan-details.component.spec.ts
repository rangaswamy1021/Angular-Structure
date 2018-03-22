import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPaymentPlanDetailsComponent } from './view-payment-plan-details.component';

describe('ViewPaymentPlanDetailsComponent', () => {
  let component: ViewPaymentPlanDetailsComponent;
  let fixture: ComponentFixture<ViewPaymentPlanDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPaymentPlanDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPaymentPlanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
