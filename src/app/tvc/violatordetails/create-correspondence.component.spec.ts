import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCorrespondenceComponent } from './create-correspondence.component';

describe('CreateCorrespondenceComponent', () => {
  let component: CreateCorrespondenceComponent;
  let fixture: ComponentFixture<CreateCorrespondenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCorrespondenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCorrespondenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
