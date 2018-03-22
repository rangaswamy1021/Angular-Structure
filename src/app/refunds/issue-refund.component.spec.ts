import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueRefundComponent } from './issue-refund.component';

describe('IssueRefundComponent', () => {
  let component: IssueRefundComponent;
  let fixture: ComponentFixture<IssueRefundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueRefundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
