import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestNewTagsComponent } from './request-new-tags.component';

describe('RequestNewTagsComponent', () => {
  let component: RequestNewTagsComponent;
  let fixture: ComponentFixture<RequestNewTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestNewTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestNewTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
