import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageVepPassesComponent } from './manage-vep-passes.component';

describe('ManageVepPassesComponent', () => {
  let component: ManageVepPassesComponent;
  let fixture: ComponentFixture<ManageVepPassesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageVepPassesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageVepPassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
