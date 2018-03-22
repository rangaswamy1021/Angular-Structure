import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsDistributionToLocationComponent } from './tags-distribution-to-location.component';

describe('TagsDistributionToLocationComponent', () => {
  let component: TagsDistributionToLocationComponent;
  let fixture: ComponentFixture<TagsDistributionToLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsDistributionToLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsDistributionToLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
