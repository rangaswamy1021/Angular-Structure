import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTripsComponent } from './invoice-trips.component';

describe('InvoiceTripsComponent', () => {
  let component: InvoiceTripsComponent;
  let fixture: ComponentFixture<InvoiceTripsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceTripsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
