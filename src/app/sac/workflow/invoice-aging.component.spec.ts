import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceAgingComponent } from './invoice-aging.component';

describe('InvoiceAgingComponent', () => {
  let component: InvoiceAgingComponent;
  let fixture: ComponentFixture<InvoiceAgingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceAgingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
