import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountsSummaryDetailsComponent } from './amounts-summary-details.component';

describe('AmountsSummaryDetailsComponent', () => {
  let component: AmountsSummaryDetailsComponent;
  let fixture: ComponentFixture<AmountsSummaryDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmountsSummaryDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountsSummaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
