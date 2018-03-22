import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedDocumentsComponent } from './received-documents.component';

describe('ReceivedDocumentsComponent', () => {
  let component: ReceivedDocumentsComponent;
  let fixture: ComponentFixture<ReceivedDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivedDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
