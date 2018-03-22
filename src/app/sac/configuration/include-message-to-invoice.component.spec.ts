import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncludeMessageToInvoiceComponent } from './include-message-to-invoice.component';

describe('IncludeMessageToInvoiceComponent', () => {
  let component: IncludeMessageToInvoiceComponent;
  let fixture: ComponentFixture<IncludeMessageToInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncludeMessageToInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncludeMessageToInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
