import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TvcReceivedDocumentsComponent } from './tvc-received-documents.component';

describe('TvcReceivedDocumentsComponent', () => {
  let component: TvcReceivedDocumentsComponent;
  let fixture: ComponentFixture<TvcReceivedDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TvcReceivedDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TvcReceivedDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
