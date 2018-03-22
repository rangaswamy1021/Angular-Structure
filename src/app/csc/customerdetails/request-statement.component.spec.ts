import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestStatementComponent } from './request-statement.component';

describe('RequestStatementComponent', () => {
  let component: RequestStatementComponent;
  let fixture: ComponentFixture<RequestStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestStatementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
