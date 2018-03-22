import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationPaymentHistoryComponent } from './violation-payment-history.component';

describe('ViolationPaymentHistoryComponent', () => {
  let component: ViolationPaymentHistoryComponent;
  let fixture: ComponentFixture<ViolationPaymentHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationPaymentHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationPaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
