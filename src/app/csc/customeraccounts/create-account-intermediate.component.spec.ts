import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountIntermediateComponent } from './create-account-intermediate.component';

describe('CreateAccountIntermediateComponent', () => {
  let component: CreateAccountIntermediateComponent;
  let fixture: ComponentFixture<CreateAccountIntermediateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountIntermediateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountIntermediateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
