import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlansComponent } from './create-plans.component';

describe('CreatePlansComponent', () => {
  let component: CreatePlansComponent;
  let fixture: ComponentFixture<CreatePlansComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePlansComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
