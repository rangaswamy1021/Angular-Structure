import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationPaymentComponent } from './violation-payment.component';

describe('ViolationPaymentComponent', () => {
  let component: ViolationPaymentComponent;
  let fixture: ComponentFixture<ViolationPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
