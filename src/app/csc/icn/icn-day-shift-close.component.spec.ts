import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnDayShiftCloseComponent } from './icn-day-shift-close.component';

describe('IcnDayShiftCloseComponent', () => {
  let component: IcnDayShiftCloseComponent;
  let fixture: ComponentFixture<IcnDayShiftCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnDayShiftCloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnDayShiftCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
