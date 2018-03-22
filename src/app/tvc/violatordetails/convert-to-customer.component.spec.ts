import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertToCustomerComponent } from './convert-to-customer.component';

describe('ConvertToCustomerComponent', () => {
  let component: ConvertToCustomerComponent;
  let fixture: ComponentFixture<ConvertToCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertToCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertToCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
