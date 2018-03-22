import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkDocumentComponent } from './link-document.component';

describe('LinkDocumentComponent', () => {
  let component: LinkDocumentComponent;
  let fixture: ComponentFixture<LinkDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
