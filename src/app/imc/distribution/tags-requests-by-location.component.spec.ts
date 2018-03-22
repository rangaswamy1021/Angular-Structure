import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsRequestsByLocationComponent } from './tags-requests-by-location.component';

describe('TagsRequestsByLocationComponent', () => {
  let component: TagsRequestsByLocationComponent;
  let fixture: ComponentFixture<TagsRequestsByLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsRequestsByLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsRequestsByLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
