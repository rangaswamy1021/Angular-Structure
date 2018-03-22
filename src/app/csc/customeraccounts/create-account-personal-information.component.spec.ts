import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAccountPersonalInformationComponent } from './create-account-personal-information.component';

describe('CreateAccountPersonalInformationComponent', () => {
  let component: CreateAccountPersonalInformationComponent;
  let fixture: ComponentFixture<CreateAccountPersonalInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAccountPersonalInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAccountPersonalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
