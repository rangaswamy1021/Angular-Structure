import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBankDetailsComponent } from './add-bank-details.component';

describe('AddBankDetailsComponent', () => {
  let component: AddBankDetailsComponent;
  let fixture: ComponentFixture<AddBankDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBankDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
