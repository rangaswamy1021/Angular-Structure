import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitThankYouComponent } from './split-thank-you.component';

describe('SplitThankYouComponent', () => {
  let component: SplitThankYouComponent;
  let fixture: ComponentFixture<SplitThankYouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitThankYouComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitThankYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
