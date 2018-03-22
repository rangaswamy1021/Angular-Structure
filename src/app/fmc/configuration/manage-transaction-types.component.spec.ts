import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTransactionTypesComponent } from './manage-transaction-types.component';

describe('ManageTransactionTypesComponent', () => {
  let component: ManageTransactionTypesComponent;
  let fixture: ComponentFixture<ManageTransactionTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTransactionTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTransactionTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
