import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTollSchedulesComponent } from './manage-toll-schedules.component';

describe('ManageTollSchedulesComponent', () => {
  let component: ManageTollSchedulesComponent;
  let fixture: ComponentFixture<ManageTollSchedulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTollSchedulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTollSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
