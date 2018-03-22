import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSqlJobsComponent } from './add-sql-jobs.component';

describe('AddSqlJobsComponent', () => {
  let component: AddSqlJobsComponent;
  let fixture: ComponentFixture<AddSqlJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSqlJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSqlJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
