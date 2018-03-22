import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VepPassThankYouComponent } from './vep-pass-thank-you.component';

describe('VepPassThankYouComponent', () => {
  let component: VepPassThankYouComponent;
  let fixture: ComponentFixture<VepPassThankYouComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VepPassThankYouComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VepPassThankYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
