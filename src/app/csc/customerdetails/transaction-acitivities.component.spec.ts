import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionAcitivitiesComponent } from './transaction-acitivities.component';

describe('TransactionAcitivitiesComponent', () => {
  let component: TransactionAcitivitiesComponent;
  let fixture: ComponentFixture<TransactionAcitivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionAcitivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionAcitivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
