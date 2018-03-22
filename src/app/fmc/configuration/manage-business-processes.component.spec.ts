import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBusinessProcessesComponent } from './manage-business-processes.component';

describe('ManageBusinessProcessesComponent', () => {
  let component: ManageBusinessProcessesComponent;
  let fixture: ComponentFixture<ManageBusinessProcessesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBusinessProcessesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBusinessProcessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
