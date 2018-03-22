import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetVehiclesComponent } from './get-vehicles.component';

describe('GetVehiclesComponent', () => {
  let component: GetVehiclesComponent;
  let fixture: ComponentFixture<GetVehiclesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetVehiclesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
