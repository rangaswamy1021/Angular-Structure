import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPreferencesComponent } from './customer-preferences.component';

describe('CustomerPreferencesComponent', () => {
  let component: CustomerPreferencesComponent;
  let fixture: ComponentFixture<CustomerPreferencesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerPreferencesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPreferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
