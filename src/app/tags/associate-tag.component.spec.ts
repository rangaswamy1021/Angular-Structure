import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateTagComponent } from './associate-tag.component';

describe('AssociateTagComponent', () => {
  let component: AssociateTagComponent;
  let fixture: ComponentFixture<AssociateTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
