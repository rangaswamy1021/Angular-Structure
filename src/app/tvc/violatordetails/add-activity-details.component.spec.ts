import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActivityDetailsComponent } from './add-activity-details.component';

describe('AddActivityDetailsComponent', () => {
  let component: AddActivityDetailsComponent;
  let fixture: ComponentFixture<AddActivityDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddActivityDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddActivityDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
