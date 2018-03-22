import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FmcCreditCardComponent } from './fmc-credit-card.component';

describe('FmcCreditCardComponent', () => {
  let component: FmcCreditCardComponent;
  let fixture: ComponentFixture<FmcCreditCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FmcCreditCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FmcCreditCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
