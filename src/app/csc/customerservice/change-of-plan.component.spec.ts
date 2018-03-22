import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeOfPlanComponent } from './change-of-plan.component';

describe('ChangeOfPlanComponent', () => {
  let component: ChangeOfPlanComponent;
  let fixture: ComponentFixture<ChangeOfPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeOfPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeOfPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
