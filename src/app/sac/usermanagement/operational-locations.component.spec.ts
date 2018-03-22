import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalLocationsComponent } from './operational-locations.component';

describe('OperationalLocationsComponent', () => {
  let component: OperationalLocationsComponent;
  let fixture: ComponentFixture<OperationalLocationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationalLocationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationalLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
