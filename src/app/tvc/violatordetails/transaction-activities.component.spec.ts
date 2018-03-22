import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionActivitiesComponent } from './transaction-activities.component';

describe('TransactionActivitiesComponent', () => {
  let component: TransactionActivitiesComponent;
  let fixture: ComponentFixture<TransactionActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
