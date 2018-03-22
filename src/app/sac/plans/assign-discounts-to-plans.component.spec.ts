import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDiscountsToPlansComponent } from './assign-discounts-to-plans.component';

describe('AssignDiscountsToPlansComponent', () => {
  let component: AssignDiscountsToPlansComponent;
  let fixture: ComponentFixture<AssignDiscountsToPlansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignDiscountsToPlansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignDiscountsToPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
