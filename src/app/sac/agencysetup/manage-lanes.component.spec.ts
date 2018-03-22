import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLanesComponent } from './manage-lanes.component';

describe('ManageLanesComponent', () => {
  let component: ManageLanesComponent;
  let fixture: ComponentFixture<ManageLanesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageLanesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
