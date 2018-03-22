import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlazaRegistrationComponent } from './plaza-registration.component';

describe('PlazaRegistrationComponent', () => {
  let component: PlazaRegistrationComponent;
  let fixture: ComponentFixture<PlazaRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlazaRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlazaRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
