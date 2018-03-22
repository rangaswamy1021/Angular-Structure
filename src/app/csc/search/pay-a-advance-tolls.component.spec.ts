import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayAAdvanceTollsComponent } from './pay-a-advance-tolls.component';

describe('PayAAdvanceTollsComponent', () => {
  let component: PayAAdvanceTollsComponent;
  let fixture: ComponentFixture<PayAAdvanceTollsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayAAdvanceTollsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayAAdvanceTollsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
