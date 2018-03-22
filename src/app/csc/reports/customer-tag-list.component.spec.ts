import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTagListComponent } from './customer-tag-list.component';

describe('CustomerTagListComponent', () => {
  let component: CustomerTagListComponent;
  let fixture: ComponentFixture<CustomerTagListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerTagListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTagListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
