import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannedDocumentComponent } from './scanned-document.component';

describe('ScannedDocumentComponent', () => {
  let component: ScannedDocumentComponent;
  let fixture: ComponentFixture<ScannedDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScannedDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannedDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
