import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyOrderComponent } from './money-order.component';

describe('MoneyOrderComponent', () => {
  let component: MoneyOrderComponent;
  let fixture: ComponentFixture<MoneyOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoneyOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoneyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
