import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionListReviewComponent } from './exception-list-review.component';

describe('ExceptionListReviewComponent', () => {
  let component: ExceptionListReviewComponent;
  let fixture: ComponentFixture<ExceptionListReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExceptionListReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionListReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
