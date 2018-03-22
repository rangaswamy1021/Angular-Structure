import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentRequestsComponent } from './adjustment-requests.component';

describe('AdjustmentRequestsComponent', () => {
  let component: AdjustmentRequestsComponent;
  let fixture: ComponentFixture<AdjustmentRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
