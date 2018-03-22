import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeLinkDocumentComponent } from './de-link-document.component';

describe('DeLinkDocumentComponent', () => {
  let component: DeLinkDocumentComponent;
  let fixture: ComponentFixture<DeLinkDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeLinkDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeLinkDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
