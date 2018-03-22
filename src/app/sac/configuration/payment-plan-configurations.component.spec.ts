import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPlanConfigurationsComponent } from './payment-plan-configurations.component';

describe('PaymentPlanConfigurationsComponent', () => {
  let component: PaymentPlanConfigurationsComponent;
  let fixture: ComponentFixture<PaymentPlanConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentPlanConfigurationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentPlanConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
