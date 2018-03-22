import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReopenAccountsummaryComponent } from './reopen-accountsummary.component';

describe('ReopenAccountsummaryComponent', () => {
  let component: ReopenAccountsummaryComponent;
  let fixture: ComponentFixture<ReopenAccountsummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReopenAccountsummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReopenAccountsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
