import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViolatorSearchComponent } from './document-violator-search.component';

describe('DocumentViolatorSearchComponent', () => {
  let component: DocumentViolatorSearchComponent;
  let fixture: ComponentFixture<DocumentViolatorSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentViolatorSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentViolatorSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
