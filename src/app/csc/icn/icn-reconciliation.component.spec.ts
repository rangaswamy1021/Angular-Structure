import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcnReconciliationComponent } from './icn-reconciliation.component';

describe('IcnReconciliationComponent', () => {
  let component: IcnReconciliationComponent;
  let fixture: ComponentFixture<IcnReconciliationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcnReconciliationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcnReconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
