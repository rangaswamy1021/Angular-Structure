import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTollSchedulesComponent } from './add-toll-schedules.component';

describe('AddTollSchedulesComponent', () => {
  let component: AddTollSchedulesComponent;
  let fixture: ComponentFixture<AddTollSchedulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTollSchedulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTollSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
