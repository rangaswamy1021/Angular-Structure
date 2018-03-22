import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePeriodsComponent } from './manage-periods.component';

describe('ManagePeriodsComponent', () => {
  let component: ManagePeriodsComponent;
  let fixture: ComponentFixture<ManagePeriodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePeriodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
