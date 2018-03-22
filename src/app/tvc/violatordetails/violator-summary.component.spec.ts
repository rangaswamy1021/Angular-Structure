import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolatorSummaryComponent } from './violator-summary.component';

describe('ViolatorSummaryComponent', () => {
  let component: ViolatorSummaryComponent;
  let fixture: ComponentFixture<ViolatorSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolatorSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolatorSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
