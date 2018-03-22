import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepleshActivitiesComponent } from './replesh-activities.component';

describe('RepleshActivitiesComponent', () => {
  let component: RepleshActivitiesComponent;
  let fixture: ComponentFixture<RepleshActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepleshActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepleshActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
