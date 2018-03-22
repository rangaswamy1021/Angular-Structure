import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBulkTagsComponent } from './manage-bulk-tags.component';

describe('ManageBulkTagsComponent', () => {
  let component: ManageBulkTagsComponent;
  let fixture: ComponentFixture<ManageBulkTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBulkTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBulkTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
