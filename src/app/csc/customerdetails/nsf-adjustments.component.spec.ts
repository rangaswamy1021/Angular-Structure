import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NsfAdjustmentsComponent } from './nsf-adjustments.component';

describe('NsfAdjustmentsComponent', () => {
  let component: NsfAdjustmentsComponent;
  let fixture: ComponentFixture<NsfAdjustmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NsfAdjustmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NsfAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
