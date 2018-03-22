import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCashDetailsComponent } from './add-cash-details.component';

describe('AddCashDetailsComponent', () => {
  let component: AddCashDetailsComponent;
  let fixture: ComponentFixture<AddCashDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCashDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCashDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
