import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecourtTrackingComponent } from './precourt-tracking.component';

describe('PrecourtTrackingComponent', () => {
  let component: PrecourtTrackingComponent;
  let fixture: ComponentFixture<PrecourtTrackingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrecourtTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecourtTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
