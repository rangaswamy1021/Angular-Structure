import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationTransferToCustomerComponent } from './violation-transfer-to-customer.component';

describe('ViolationTransferToCustomerComponent', () => {
  let component: ViolationTransferToCustomerComponent;
  let fixture: ComponentFixture<ViolationTransferToCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationTransferToCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationTransferToCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
