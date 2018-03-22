import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageInvoiceAgingComponent } from './manage-invoice-aging.component';

describe('ManageInvoiceAgingComponent', () => {
  let component: ManageInvoiceAgingComponent;
  let fixture: ComponentFixture<ManageInvoiceAgingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageInvoiceAgingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageInvoiceAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
