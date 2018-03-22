import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintTurnAroundTimeComponent } from './complaint-turn-around-time.component';

describe('ComplaintTurnAroundTimeComponent', () => {
  let component: ComplaintTurnAroundTimeComponent;
  let fixture: ComponentFixture<ComplaintTurnAroundTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplaintTurnAroundTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplaintTurnAroundTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
