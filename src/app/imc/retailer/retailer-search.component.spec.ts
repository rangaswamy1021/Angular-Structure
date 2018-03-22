import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerSearchComponent } from './retailer-search.component';

describe('RetailerSearchComponent', () => {
  let component: RetailerSearchComponent;
  let fixture: ComponentFixture<RetailerSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
