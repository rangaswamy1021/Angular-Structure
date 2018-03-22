import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvcSentDocumentsComponent } from './tvc-sent-documents.component';

describe('TvcSentDocumentsComponent', () => {
  let component: TvcSentDocumentsComponent;
  let fixture: ComponentFixture<TvcSentDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvcSentDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvcSentDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
