import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignFeesToPlansComponent } from './assign-fees-to-plans.component';

describe('AssignFeesToPlansComponent', () => {
  let component: AssignFeesToPlansComponent;
  let fixture: ComponentFixture<AssignFeesToPlansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignFeesToPlansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignFeesToPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
