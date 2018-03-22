import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPreviewComponent } from './split-preview.component';

describe('SplitPreviewComponent', () => {
  let component: SplitPreviewComponent;
  let fixture: ComponentFixture<SplitPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
