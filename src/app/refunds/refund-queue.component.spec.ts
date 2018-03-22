import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundQueueComponent } from './refund-queue.component';

describe('RefundQueueComponent', () => {
  let component: RefundQueueComponent;
  let fixture: ComponentFixture<RefundQueueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundQueueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
