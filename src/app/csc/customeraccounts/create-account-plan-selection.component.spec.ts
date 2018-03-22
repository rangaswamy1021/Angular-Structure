import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountPlanSelectionComponent } from './create-account-plan-selection.component';

describe('CreateAccountPlanSelectionComponent', () => {
  let component: CreateAccountPlanSelectionComponent;
  let fixture: ComponentFixture<CreateAccountPlanSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountPlanSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountPlanSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
