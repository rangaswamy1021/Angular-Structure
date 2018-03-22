import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpiringTagsComponent } from './view-expiring-tags.component';

describe('ViewExpiringTagsComponent', () => {
  let component: ViewExpiringTagsComponent;
  let fixture: ComponentFixture<ViewExpiringTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewExpiringTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewExpiringTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
