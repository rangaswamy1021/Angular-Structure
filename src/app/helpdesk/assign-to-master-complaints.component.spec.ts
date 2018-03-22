import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignToMasterComplaintsComponent } from './assign-to-master-complaints.component';

describe('AssignToMasterComplaintsComponent', () => {
  let component: AssignToMasterComplaintsComponent;
  let fixture: ComponentFixture<AssignToMasterComplaintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignToMasterComplaintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignToMasterComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
