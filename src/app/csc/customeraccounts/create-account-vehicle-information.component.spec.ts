import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountVehicleInformationComponent } from './create-account-vehicle-information.component';

describe('CreateAccountVehicleInformationComponent', () => {
  let component: CreateAccountVehicleInformationComponent;
  let fixture: ComponentFixture<CreateAccountVehicleInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountVehicleInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountVehicleInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
