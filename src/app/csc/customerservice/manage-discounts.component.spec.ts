import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDiscountsComponent } from './manage-discounts.component';

describe('ManagediscountsComponent', () => {
  let component: ManageDiscountsComponent;
  let fixture: ComponentFixture<ManageDiscountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageDiscountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDiscountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
