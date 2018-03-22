import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCorrespondenceComponent } from './view-correspondence.component';

describe('ViewCorrespondenceComponent', () => {
  let component: ViewCorrespondenceComponent;
  let fixture: ComponentFixture<ViewCorrespondenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCorrespondenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
