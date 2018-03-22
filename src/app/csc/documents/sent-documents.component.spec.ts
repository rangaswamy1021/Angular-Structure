import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentDocumentsComponent } from './sent-documents.component';

describe('SentDocumentsComponent', () => {
  let component: SentDocumentsComponent;
  let fixture: ComponentFixture<SentDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
