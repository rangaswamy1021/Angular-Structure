import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsrRelationsComponent } from './csr-relations.component';

describe('CsrRelationsComponent', () => {
  let component: CsrRelationsComponent;
  let fixture: ComponentFixture<CsrRelationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsrRelationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsrRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
