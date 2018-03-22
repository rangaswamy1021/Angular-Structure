import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerUsersSearchComponent } from './retailer-users-search.component';

describe('RetailerUsersSearchComponent', () => {
  let component: RetailerUsersSearchComponent;
  let fixture: ComponentFixture<RetailerUsersSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerUsersSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerUsersSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
