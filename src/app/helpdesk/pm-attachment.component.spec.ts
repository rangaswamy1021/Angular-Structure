import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PmAttachmentComponent } from './pm-attachment.component';

describe('PmAttachmentComponent', () => {
  let component: PmAttachmentComponent;
  let fixture: ComponentFixture<PmAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PmAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
