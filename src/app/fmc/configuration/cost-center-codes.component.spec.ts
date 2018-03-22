import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCenterCodesComponent } from './cost-center-codes.component';

describe('CostCenterCodesComponent', () => {
  let component: CostCenterCodesComponent;
  let fixture: ComponentFixture<CostCenterCodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostCenterCodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostCenterCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
