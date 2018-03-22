import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodCloseComponent } from './period-close.component';

describe('PeriodCloseComponent', () => {
  let component: PeriodCloseComponent;
  let fixture: ComponentFixture<PeriodCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodCloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
