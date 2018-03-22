import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPlanSelectionComponent } from './split-plan-selection.component';

describe('SplitPlanSelectionComponent', () => {
  let component: SplitPlanSelectionComponent;
  let fixture: ComponentFixture<SplitPlanSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitPlanSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPlanSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
