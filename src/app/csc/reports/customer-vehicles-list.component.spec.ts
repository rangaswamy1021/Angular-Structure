import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerVehiclesListComponent } from './customer-vehicles-list.component';

describe('CustomerVehiclesListComponent', () => {
  let component: CustomerVehiclesListComponent;
  let fixture: ComponentFixture<CustomerVehiclesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerVehiclesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerVehiclesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
