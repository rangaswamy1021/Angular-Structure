import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateViolatorComponent } from './create-violator.component';

describe('CreateViolatorComponent', () => {
  let component: CreateViolatorComponent;
  let fixture: ComponentFixture<CreateViolatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateViolatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateViolatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
