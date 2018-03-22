import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsHistoryComponent } from './tags-history.component';

describe('TagsHistoryComponent', () => {
  let component: TagsHistoryComponent;
  let fixture: ComponentFixture<TagsHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
