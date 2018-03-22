import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitSearchComponent } from './split-search.component';

describe('SplitSearchComponent', () => {
  let component: SplitSearchComponent;
  let fixture: ComponentFixture<SplitSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
