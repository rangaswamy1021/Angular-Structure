import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCreditCardDetailsComponent } from './add-credit-card-details.component';

describe('AddCreditCardDetailsComponent', () => {
  let component: AddCreditCardDetailsComponent;
  let fixture: ComponentFixture<AddCreditCardDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCreditCardDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCreditCardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
