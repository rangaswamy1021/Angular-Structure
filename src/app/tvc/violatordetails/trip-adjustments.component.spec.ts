import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripAdjustmentsComponent } from './trip-adjustments.component';

describe('TripAdjustmentsComponent', () => {
  let component: TripAdjustmentsComponent;
  let fixture: ComponentFixture<TripAdjustmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TripAdjustmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TripAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
