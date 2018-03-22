import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceAdjustmentsComponent } from './invoice-adjustments.component';

describe('InvoiceAdjustmentsComponent', () => {
  let component: InvoiceAdjustmentsComponent;
  let fixture: ComponentFixture<InvoiceAdjustmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceAdjustmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
