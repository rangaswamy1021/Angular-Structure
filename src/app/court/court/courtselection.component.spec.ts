import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtselectionComponent } from './courtselection.component';

describe('CourtselectionComponent', () => {
  let component: CourtselectionComponent;
  let fixture: ComponentFixture<CourtselectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourtselectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
