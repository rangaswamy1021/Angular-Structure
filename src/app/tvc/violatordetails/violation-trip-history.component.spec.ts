import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationTripHistoryComponent } from './violation-trip-history.component';

describe('ViolationTripHistoryComponent', () => {
  let component: ViolationTripHistoryComponent;
  let fixture: ComponentFixture<ViolationTripHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationTripHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationTripHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
