import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourttrackingComponent } from './courttracking.component';

describe('CourttrackingComponent', () => {
  let component: CourttrackingComponent;
  let fixture: ComponentFixture<CourttrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourttrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourttrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
