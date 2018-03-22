import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseFiscalYearComponent } from './close-fiscal-year.component';

describe('CloseFiscalYearComponent', () => {
  let component: CloseFiscalYearComponent;
  let fixture: ComponentFixture<CloseFiscalYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseFiscalYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseFiscalYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
