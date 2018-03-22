import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationSearchComponent } from './violation-search.component';

describe('ViolationSearchComponent', () => {
  let component: ViolationSearchComponent;
  let fixture: ComponentFixture<ViolationSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
