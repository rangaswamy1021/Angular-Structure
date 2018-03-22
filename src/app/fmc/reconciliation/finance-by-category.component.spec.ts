import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceByCategoryComponent } from './finance-by-category.component';

describe('FinanceByCategoryComponent', () => {
  let component: FinanceByCategoryComponent;
  let fixture: ComponentFixture<FinanceByCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceByCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
