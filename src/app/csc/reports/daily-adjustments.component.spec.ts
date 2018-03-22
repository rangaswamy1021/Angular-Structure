import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAdjustmentsComponent } from './daily-adjustments.component';

describe('DailyAdjustmentsComponent', () => {
  let component: DailyAdjustmentsComponent;
  let fixture: ComponentFixture<DailyAdjustmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyAdjustmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
