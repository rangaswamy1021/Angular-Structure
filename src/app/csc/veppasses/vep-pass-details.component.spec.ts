import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VepPassDetailsComponent } from './vep-pass-details.component';

describe('VepPassDetailsComponent', () => {
  let component: VepPassDetailsComponent;
  let fixture: ComponentFixture<VepPassDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VepPassDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VepPassDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
