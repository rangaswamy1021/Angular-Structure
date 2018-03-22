import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChartOfAccountsComponent } from './manage-chart-of-accounts.component';

describe('ManageChartOfAccountsComponent', () => {
  let component: ManageChartOfAccountsComponent;
  let fixture: ComponentFixture<ManageChartOfAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageChartOfAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageChartOfAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
