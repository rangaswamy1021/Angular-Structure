import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitVehiclesComponent } from './split-vehicles.component';

describe('SplitVehiclesComponent', () => {
  let component: SplitVehiclesComponent;
  let fixture: ComponentFixture<SplitVehiclesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitVehiclesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
