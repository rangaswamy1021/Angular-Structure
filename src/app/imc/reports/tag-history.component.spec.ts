import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagHistoryComponent } from './tag-history.component';

describe('TagHistoryComponent', () => {
  let component: TagHistoryComponent;
  let fixture: ComponentFixture<TagHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
