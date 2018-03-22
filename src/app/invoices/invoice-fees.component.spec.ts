import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceFeesComponent } from './invoice-fees.component';

describe('InvoiceFeesComponent', () => {
  let component: InvoiceFeesComponent;
  let fixture: ComponentFixture<InvoiceFeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceFeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
