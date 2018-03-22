import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCustomerSearchComponent } from './document-customer-search.component';

describe('DocumentCustomerSearchComponent', () => {
  let component: DocumentCustomerSearchComponent;
  let fixture: ComponentFixture<DocumentCustomerSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentCustomerSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentCustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
