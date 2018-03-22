import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerBankComponent } from './retailer-bank.component';

describe('RetailerBankComponent', () => {
  let component: RetailerBankComponent;
  let fixture: ComponentFixture<RetailerBankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetailerBankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailerBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
